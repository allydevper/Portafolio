// Mesa 3D: tablones de madera, cubiletes, dados con caras pintadas en canvas y reproducción de las tiradas grabadas por physics.js
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { seeded, shadersReady, maxDpr, reduceMotion, follow, ease } from '../vuelo/util.js';
import { TRAY, POUR, CUP_REST, normalOf, simulateThrow } from './physics.js';
import { clack, rattle, roll } from './sound.js';
import { makeDieMesh, applyLook } from './dice3d.js';

// Mesa: 34×30 unidades (tablones de ~3.2 de ancho)
const TABLE_W = 34, TABLE_D = 30;

// Cubilete: el pivote está en la base y la orientación dice hacia dónde mira la boca.
// Descansa boca abajo a un costado de quien tira; para tirar se vuelca hacia el centro con la boca donde nacen los dados
const CUP_H = 2.4, POUR_TILT = 105 * Math.PI / 180;
// Altura del eje cuando está acostado: lo más ancho (la boca) toca la mesa
const CUP_LAY_Y = 1.45;
const UP = new THREE.Vector3(0, 1, 0);
const aimAt = axis => new THREE.Quaternion().setFromUnitVectors(UP, axis.clone().normalize());
const MOUTH_DOWN = aimAt(new THREE.Vector3(0, -1, 0));
const cupRest = from => ({ pos: new THREE.Vector3(from * CUP_REST.x, CUP_H, from * CUP_REST.z), quat: MOUTH_DOWN.clone() });
const cupPour = from => {
    const down = POUR_TILT - Math.PI / 2;
    return {
        pos: new THREE.Vector3(0, POUR.y + Math.sin(down) * CUP_H, from * (POUR.z + .2 + Math.cos(down) * CUP_H)),
        quat: aimAt(new THREE.Vector3(0, -Math.sin(down), -from * Math.cos(down))),
    };
};
// Fila donde se apartan los dados guardados, en el borde de la mesa del lado de quien tira
const lockSpot = (k, from) => new THREE.Vector3(-3.1 + k * 1.25, .5, from * (TRAY.d / 2 + .9));

// ---------- Mesa: tablones viejos de roble, con vetas, nudos, grietas, rayones y manchas ----------
// Se pinta a la vez el color y el relieve (oscuro = hundido) para que la luz marque las vetas
// Una sola pieza sin repetir (W×H px para TABLE_W×TABLE_D unidades), así no se notan costuras
function tableCanvases(seed, W = 2560, H = 2260) {
    const rand = seeded(seed);
    const size = W;
    const mk = () => {
        const c = document.createElement('canvas');
        c.width = W;
        c.height = H;
        return [c, c.getContext('2d')];
    };
    const [color, g] = mk(), [bump, b] = mk();
    b.fillStyle = '#808080';
    b.fillRect(0, 0, W, H);
    const PLANKS = 9, ph = H / PLANKS;
    const tones = ['#4d3a29', '#433327', '#55402e', '#3f3024', '#493726'];
    for (let p = 0; p < PLANKS; p++) {
        const y0 = p * ph;
        // Cada tablón está hecho de tramos con su propio tono, unidos a tope en sitios distintos
        const j1 = 250 + rand() * (size - 500);
        const joints = rand() < .5 ? [j1] : [j1, (j1 + size * (.35 + rand() * .3)) % size].sort((a, b) => a - b);
        [0, ...joints].forEach((x, i) => {
            g.fillStyle = tones[(p + i * 2 + (rand() * 2 | 0)) % tones.length];
            g.fillRect(x, y0, (joints[i] ?? size) - x, ph);
        });
        // Variación de tono a lo largo del tablón
        for (let i = 0; i < 18; i++) {
            const x = rand() * size, w = 120 + rand() * 500;
            const lg = g.createLinearGradient(x - w, 0, x + w, 0);
            const a = (.05 + rand() * .12).toFixed(2);
            lg.addColorStop(0, 'rgba(0,0,0,0)');
            lg.addColorStop(.5, rand() < .5 ? `rgba(20,10,4,${a})` : `rgba(150,105,60,${a})`);
            lg.addColorStop(1, 'rgba(0,0,0,0)');
            g.fillStyle = lg;
            g.fillRect(x - w, y0, w * 2, ph);
        }
        // Vetas: ondas largas que rodean los nudos
        const knots = [...Array(1 + (rand() * 3 | 0))].map(() => [rand() * size, y0 + ph * (.2 + rand() * .6), 10 + rand() * 22]);
        for (let i = 0; i < 150; i++) {
            const yb = y0 + rand() * ph, amp = 1 + rand() * 5, f = .001 + rand() * .004, phs = rand() * 6;
            const dark = rand() < .75;
            g.strokeStyle = dark ? `rgba(22,11,4,${.12 + rand() * .3})` : `rgba(170,120,70,${.06 + rand() * .12})`;
            g.lineWidth = .8 + rand() * 3;
            b.strokeStyle = dark ? `rgba(40,40,40,${.2 + rand() * .3})` : 'rgba(170,170,170,.15)';
            b.lineWidth = g.lineWidth;
            g.beginPath();
            b.beginPath();
            for (let x = 0; x <= size; x += 16) {
                let y = yb + Math.sin(x * f + phs) * amp + Math.sin(x * f * 4.3) * amp * .25;
                for (const [kx, ky, kr] of knots) {
                    const dx = (x - kx) / (kr * 7), dy = y - ky;
                    y += Math.exp(-dx * dx) * Math.sign(dy || 1) * kr * 1.6 / (1 + Math.abs(dy) / (kr * 2));
                }
                y = Math.min(y0 + ph - 2, Math.max(y0 + 2, y));
                g.lineTo(x, y);
                b.lineTo(x, y);
            }
            g.stroke();
            b.stroke();
        }
        for (const [kx, ky, kr] of knots) {
            for (let k = 5; k >= 0; k--) {
                g.fillStyle = `rgba(${25 + k * 8},${12 + k * 5},${4 + k * 2},${.35 + (5 - k) * .1})`;
                g.beginPath();
                g.ellipse(kx, ky, kr * (1 + k * .5) * 1.8, kr * (1 + k * .35), 0, 0, 7);
                g.fill();
            }
            b.fillStyle = '#383838';
            b.beginPath();
            b.ellipse(kx, ky, kr * 1.6, kr, 0, 0, 7);
            b.fill();
        }
        // Grietas a lo largo de la veta
        for (let i = 0; i < 9; i++) {
            const x = rand() * size, y = y0 + 10 + rand() * (ph - 20), l = 80 + rand() * 320;
            const lw = 1.5 + rand() * 2;
            const pts = [];
            for (let t = 0; t <= l; t += 20) pts.push([x + t, y + Math.sin(t * .05) * 2 + (rand() - .5) * 2]);
            for (const [ctx, col] of [[g, 'rgba(10,5,2,.8)'], [b, '#101010']]) {
                ctx.strokeStyle = col;
                ctx.lineWidth = lw;
                ctx.beginPath();
                pts.forEach(([px, py]) => ctx.lineTo(px, py));
                ctx.stroke();
            }
        }
        // Junta entre tablones: ranura oscura con canto gastado
        g.fillStyle = 'rgba(8,4,1,.9)';
        g.fillRect(0, y0, size, 7);
        g.fillStyle = 'rgba(190,140,90,.12)';
        g.fillRect(0, y0 + 7, size, 4);
        b.fillStyle = '#000';
        b.fillRect(0, y0, size, 8);
        // Juntas a tope con un par de clavos a cada lado
        for (const x of joints) {
            g.fillStyle = 'rgba(8,4,1,.85)';
            g.fillRect(x - 2, y0, 5, ph);
            b.fillStyle = '#000';
            b.fillRect(x - 2, y0, 5, ph);
            for (const dx of [-26, 26]) for (const yy of [y0 + ph * .28, y0 + ph * .72]) {
                g.fillStyle = '#1c1714';
                g.beginPath();
                g.arc(x + dx, yy, 8, 0, 7);
                g.fill();
                g.fillStyle = 'rgba(120,110,100,.35)';
                g.beginPath();
                g.arc(x + dx - 2, yy - 2, 3.5, 0, 7);
                g.fill();
                b.fillStyle = '#c0c0c0';
                b.beginPath();
                b.arc(x + dx, yy, 8, 0, 7);
                b.fill();
            }
        }
    }
    // Rayones y golpes de años de uso
    for (let i = 0; i < 1500; i++) {
        const x = rand() * W, y = rand() * H, a = (rand() - .5) * .8 + (rand() < .3 ? 1.57 : 0), l = 6 + rand() * 60;
        g.strokeStyle = `rgba(200,150,100,${.05 + rand() * .12})`;
        g.lineWidth = .7 + rand() * 1.5;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        g.stroke();
        b.strokeStyle = 'rgba(50,50,50,.5)';
        b.lineWidth = g.lineWidth;
        b.beginPath();
        b.moveTo(x, y);
        b.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        b.stroke();
    }
    // Manchas de vino y de grasa
    for (let i = 0; i < 9; i++) {
        const x = rand() * W, y = rand() * H, r = 40 + rand() * 90;
        if (rand() < .5) {
            g.strokeStyle = `rgba(40,8,10,${.15 + rand() * .15})`;
            g.lineWidth = 3 + rand() * 4;
            g.beginPath();
            g.arc(x, y, r * .6, 0, 7);
            g.stroke();
        } else {
            const rg = g.createRadialGradient(x, y, 0, x, y, r);
            rg.addColorStop(0, 'rgba(15,8,3,.35)');
            rg.addColorStop(1, 'rgba(15,8,3,0)');
            g.fillStyle = rg;
            g.fillRect(x - r, y - r, r * 2, r * 2);
        }
    }
    // ---------- Años de taberna ----------
    // Cortes de cuchillo: hendidura oscura con el borde levantado más claro
    for (let i = 0; i < 70; i++) {
        const x = rand() * W, y = rand() * H, a = rand() * 6.3, l = 20 + rand() * 90;
        const ex = x + Math.cos(a) * l, ey = y + Math.sin(a) * l;
        g.strokeStyle = 'rgba(12,6,2,.7)';
        g.lineWidth = 1.5 + rand() * 1.5;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(ex, ey);
        g.stroke();
        g.strokeStyle = 'rgba(200,160,115,.18)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x + 2, y + 2);
        g.lineTo(ex + 2, ey + 2);
        g.stroke();
        b.strokeStyle = '#141414';
        b.lineWidth = 3;
        b.beginPath();
        b.moveTo(x, y);
        b.lineTo(ex, ey);
        b.stroke();
    }
    // Golpes y astillados: manchones hundidos
    for (let i = 0; i < 45; i++) {
        const x = rand() * W, y = rand() * H, r = 4 + rand() * 12;
        g.fillStyle = 'rgba(15,8,3,.45)';
        b.fillStyle = '#3a3a3a';
        for (const ctx of [g, b]) {
            ctx.beginPath();
            ctx.ellipse(x, y, r * (1 + rand()), r, rand() * 3, 0, 7);
            ctx.fill();
        }
    }
    // Agujeros de carcoma en grupos
    for (let i = 0; i < 10; i++) {
        const cx = rand() * W, cy = rand() * H;
        for (let k = 0; k < 6 + rand() * 14; k++) {
            const x = cx + (rand() - .5) * 90, y = cy + (rand() - .5) * 60, r = 1.5 + rand() * 2;
            g.fillStyle = '#0b0603';
            b.fillStyle = '#000';
            for (const ctx of [g, b]) {
                ctx.beginPath();
                ctx.arc(x, y, r, 0, 7);
                ctx.fill();
            }
        }
    }
    // Quemaduras de vela y de pipa
    for (let i = 0; i < 5; i++) {
        const x = rand() * W, y = rand() * H, r = 18 + rand() * 40;
        const rg = g.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, 'rgba(8,4,2,.85)');
        rg.addColorStop(.55, 'rgba(25,12,4,.55)');
        rg.addColorStop(1, 'rgba(40,20,8,0)');
        g.fillStyle = rg;
        g.beginPath();
        g.ellipse(x, y, r * 1.4, r, rand() * 3, 0, 7);
        g.fill();
        b.fillStyle = 'rgba(40,40,40,.6)';
        b.beginPath();
        b.ellipse(x, y, r * .8, r * .55, 0, 0, 7);
        b.fill();
    }
    // Más aros de jarra y vino derramado
    for (let i = 0; i < 12; i++) {
        const x = rand() * W, y = rand() * H, r = 35 + rand() * 30;
        g.strokeStyle = rand() < .5 ? `rgba(45,10,12,${.18 + rand() * .2})` : `rgba(10,6,2,${.2 + rand() * .2})`;
        g.lineWidth = 2 + rand() * 5;
        g.beginPath();
        g.arc(x, y, r, rand() * 6, 6.3 + rand() * 3);
        g.stroke();
    }
    // Mugre en las ranuras y desgaste: centro más gastado y claro, bordes más sucios
    const wear = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * .45);
    wear.addColorStop(0, 'rgba(170,150,120,.13)');
    wear.addColorStop(1, 'rgba(170,150,120,0)');
    g.fillStyle = wear;
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 30; i++) {
        const x = rand() * W, y = rand() * H, r = 120 + rand() * 260;
        const rg = g.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, `rgba(10,6,3,${.1 + rand() * .15})`);
        rg.addColorStop(1, 'rgba(10,6,3,0)');
        g.fillStyle = rg;
        g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // Tono gris de madera vieja y seca
    g.globalCompositeOperation = 'saturation';
    g.fillStyle = 'rgba(128,128,128,.35)';
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over';
    // Grano fino y polvo
    for (let i = 0; i < 90000; i++) {
        g.fillStyle = rand() < .5 ? 'rgba(0,0,0,.08)' : 'rgba(255,220,180,.05)';
        g.fillRect(rand() * W, rand() * H, 1 + rand() * 2, 1);
    }
    return { color, bump };
}

// Cubilete de madera torneada, teñida oscura: veta a lo largo del eje (u alrededor, v a lo alto)
function cupCanvas(seed) {
    const rand = seeded(seed);
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const g = c.getContext('2d');
    g.fillStyle = '#1c130c';
    g.fillRect(0, 0, 1024, 512);
    // Veta: líneas casi verticales, claras y oscuras, que siguen el torneado
    for (let i = 0; i < 260; i++) {
        const x0 = rand() * 1024, amp = 2 + rand() * 7, f = .006 + rand() * .02, ph = rand() * 6;
        const light = rand() < .45;
        g.strokeStyle = light ? `rgba(130,100,70,${.06 + rand() * .14})` : `rgba(6,3,1,${.2 + rand() * .3})`;
        g.lineWidth = .6 + rand() * 2.2;
        g.beginPath();
        for (let y = 0; y <= 512; y += 8) g.lineTo(x0 + Math.sin(y * f + ph) * amp, y);
        g.stroke();
    }
    // Manchas del tinte y desgaste más claro en las zonas de agarre
    for (let i = 0; i < 40; i++) {
        const x = rand() * 1024, y = rand() * 512, r = 20 + rand() * 70;
        const rg = g.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, rand() < .6 ? 'rgba(8,5,2,.3)' : 'rgba(150,115,80,.16)');
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = rg;
        g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 6000; i++) {
        g.fillStyle = rand() < .5 ? 'rgba(0,0,0,.12)' : 'rgba(255,220,180,.05)';
        g.fillRect(rand() * 1024, rand() * 512, 1 + rand() * 2, 1 + rand());
    }
    return c;
}

export function initTable(canvas, { onPick }) {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    } catch (err) {
        return null;
    }
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#140d08');
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;

    const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
    const lookAt = new THREE.Vector3(0, 0, .3);

    // ---------- Luces: vela cálida y algo de relleno ----------
    scene.add(new THREE.HemisphereLight('#ffdcb0', '#2a1608', .55));
    const sun = new THREE.DirectionalLight('#ffd7a3', 2.3);
    sun.position.set(-5, 14, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 11, bottom: -11, near: 1, far: 40 });
    sun.shadow.bias = -.0005;
    sun.shadow.radius = 4;
    scene.add(sun);
    const candle = new THREE.PointLight('#ff9a3c', 34, 32, 1.6);
    candle.position.set(8, 4.5, -6);
    scene.add(candle);

    // ---------- Mesa ----------
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const wood = tableCanvases(5);
    const texOf = (c, srgb) => {
        const t = new THREE.CanvasTexture(c);
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = maxAniso;
        return t;
    };
    const table = new THREE.Mesh(
        new THREE.PlaneGeometry(TABLE_W, TABLE_D),
        new THREE.MeshStandardMaterial({ map: texOf(wood.color, true), bumpMap: texOf(wood.bump, false), bumpScale: 4, roughness: .86, envMapIntensity: .3 }),
    );
    table.rotation.x = -Math.PI / 2;
    table.receiveShadow = true;
    scene.add(table);

    // ---------- Cubiletes (uno por jugador) ----------
    // Perfil del torno, como un barril angosto en la cintura con estrías cerca de la base y de la boca
    const prof = [
        [0, 0], [1.26, 0], [1.36, .06], [1.4, .18], [1.35, .24], [1.4, .3], [1.35, .36], [1.41, .44],
        [1.33, 1.2],
        [1.42, 1.96], [1.37, 2.03], [1.43, 2.1], [1.38, 2.17], [1.45, 2.26], [1.46, 2.36], [1.41, CUP_H],
        [1.3, CUP_H], [1.24, 1.2], [1.22, .26], [0, .26],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const cupTex = new THREE.CanvasTexture(cupCanvas(9));
    cupTex.colorSpace = THREE.SRGBColorSpace;
    cupTex.anisotropy = maxAniso;
    const cupGeo = new THREE.LatheGeometry(prof, 56);
    const cupMat = new THREE.MeshStandardMaterial({ map: cupTex, roughness: .55, envMapIntensity: .3, side: THREE.DoubleSide });
    const cups = new Map([1, -1].map(from => {
        const mesh = new THREE.Mesh(cupGeo, cupMat);
        mesh.castShadow = mesh.receiveShadow = true;
        scene.add(mesh);
        // spin: giro propio sobre su eje (para que los dos no se vean idénticos); wobble: sacudida
        const spin = new THREE.Quaternion().setFromAxisAngle(UP, from * 2.2);
        const cup = { mesh, from, ...cupRest(from), spin, wobble: new THREE.Quaternion() };
        return [from, cup];
    }));
    const placeCup = cup => {
        cup.mesh.position.copy(cup.pos);
        cup.mesh.quaternion.copy(cup.wobble).multiply(cup.quat).multiply(cup.spin);
    };
    cups.forEach(placeCup);

    // ---------- Dados ----------
    const dice = [...Array(6)].map((_, slot) => {
        const mesh = makeDieMesh();
        mesh.castShadow = mesh.receiveShadow = true;
        mesh.userData.slot = slot;
        const group = new THREE.Group();
        group.add(mesh);
        group.visible = false;
        scene.add(group);
        return { slot, group, mesh, mats: mesh.material, lift: 0, liftTo: 0, glow: 0, glowTo: 0, base: new THREE.Vector3() };
    });

    const setDice = defs => dice.forEach((dd, i) => applyLook(dd.mesh, defs[i].look));

    // ---------- Animaciones: fn(k) con k de 0 a 1 durante dur ms ----------
    const anims = [];
    const animate = (dur, fn) => new Promise(resolve => {
        if (reduceMotion) {
            fn(1);
            resolve();
            return;
        }
        anims.push({ t: 0, dur, fn, resolve });
    });

    // Corta todo lo que esté en curso (rendirse, partida nueva): las promesas pendientes se cumplen al instante
    // y una tirada a medias ve que cambió gen y no sigue
    let gen = 0;
    function reset() {
        gen++;
        dice.forEach(dd => {
            dd.group.visible = false;
            dd.liftTo = dd.glowTo = 0;
        });
        lockCount = 0;
        anims.splice(0).forEach(a => a.resolve());
        if (playback) {
            playback.resolve();
            playback = null;
        }
        cups.forEach(cup => {
            Object.assign(cup, cupRest(cup.from));
            cup.wobble.identity();
            placeCup(cup);
        });
    }

    // ---------- Reproducción de tiradas ----------
    let playback = null;
    const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
    const va = new THREE.Vector3(), vb = new THREE.Vector3();

    function applyFrame(pb, t) {
        const f = Math.min(t / pb.sim.dt, pb.sim.steps - 1);
        const i0 = Math.floor(f), i1 = Math.min(i0 + 1, pb.sim.steps - 1), a = f - i0;
        pb.slots.forEach((slot, k) => {
            const fr = pb.sim.frames[k], dd = dice[slot];
            va.fromArray(fr, i0 * 7);
            vb.fromArray(fr, i1 * 7);
            dd.base.lerpVectors(va, vb, a);
            qa.fromArray(fr, i0 * 7 + 3);
            qb.fromArray(fr, i1 * 7 + 3);
            dd.group.quaternion.slerpQuaternions(qa, qb, a);
        });
        // Sonido de los choques que ya pasaron
        while (pb.hit < pb.sim.hits.length && pb.sim.hits[pb.hit].step <= f) clack(pb.sim.hits[pb.hit++].v);
    }

    // Mueve un cubilete de su pose actual a otra (posición y orientación)
    function moveCup(cup, dur, to) {
        const from = { pos: cup.pos.clone(), quat: cup.quat.clone() };
        return animate(dur, k => {
            const e = ease(k);
            cup.pos.lerpVectors(from.pos, to.pos, e);
            cup.quat.slerpQuaternions(from.quat, to.quat, e);
            placeCup(cup);
        });
    }

    // Un dado rueda por la mesa hasta la boca del cubilete acostado y se mete; desaparece ya tapado por el cuerpo
    function rollInto(dd, mouth, axis) {
        const p0 = dd.base.clone(), q0 = dd.group.quaternion.clone();
        const door = new THREE.Vector3(mouth.x, .5, mouth.z), inside = door.clone().addScaledVector(axis, -1.2);
        const d1 = p0.distanceTo(door), total = d1 + 1.2;
        const dir = door.clone().sub(p0).setY(0);
        if (dir.lengthSq() < 1e-6) dir.copy(axis).negate();
        dir.normalize();
        // Rodar sin resbalar: gira alrededor del eje horizontal perpendicular al avance
        const rollAxis = new THREE.Vector3().crossVectors(UP, dir).normalize();
        const qRoll = new THREE.Quaternion();
        let landed = false, nextRoll = .4;
        return animate((240 + total * 70) * .7, k => {
            // Arranca lento y acelera, como empujado hacia la boca
            const e = k * k * (1.6 - .6 * k);
            const s = e * total;
            if (s < d1) dd.base.lerpVectors(p0, door, s / d1);
            else dd.base.lerpVectors(door, inside, (s - d1) / 1.2);
            // Pequeños saltos que se apagan al acercarse
            dd.base.y = .5 + Math.abs(Math.sin(e * Math.PI * Math.max(1, Math.round(d1 / 1.6)))) * .3 * (1 - e);
            qRoll.setFromAxisAngle(rollAxis, Math.min(s, d1) / .55);
            // Roce cada vez que una cara golpea la madera al rodar
            if (s < d1 && s >= nextRoll) {
                roll(.8);
                nextRoll += .8;
            }
            dd.group.quaternion.multiplyQuaternions(qRoll, q0);
            if (!landed && s > d1 + .45) {
                landed = true;
                dd.group.visible = false;
                rattle(.9);
            }
        });
    }

    // Tira los dados de slots; faces: cara que debe quedar arriba en cada uno. from: 1 = jugador, -1 = rival
    async function throwDice(slots, faces, from) {
        const sim = simulateThrow(slots.length, from);
        const my = gen, cut = () => my !== gen;
        const cup = cups.get(from);
        slots.forEach(slot => { dice[slot].liftTo = dice[slot].glowTo = 0; });

        // Los dados que quedaron en la mesa vuelven al cubilete: se acuesta junto a ellos con la boca de frente
        // y ruedan uno tras otro hasta meterse; el cuerpo del cubilete los tapa al entrar
        const onTable = slots.filter(slot => dice[slot].group.visible);
        if (onTable.length) {
            const c = onTable.reduce((v, slot) => v.add(dice[slot].base), new THREE.Vector3()).divideScalar(onTable.length);
            c.y = 0;
            // Se elige el lado (de 8 direcciones) donde ningún dado queda detrás del cubilete,
            // que entre en la zona visible sin pisar las filas de apartados y que los dados rueden poco
            let best = null;
            for (let i = 0; i < 8; i++) {
                const out = new THREE.Vector3(Math.cos(i * Math.PI / 4), 0, Math.sin(i * Math.PI / 4));
                const reach = Math.max(0, ...onTable.map(slot => dice[slot].base.clone().sub(c).setY(0).dot(out)));
                const m = c.clone().addScaledVector(out, reach + 1.3), end = m.clone().addScaledVector(out, CUP_H);
                const over = p => Math.max(0, Math.abs(p.x) - 6.8) + Math.max(0, Math.abs(p.z) - 3.8);
                const cost = (over(m) + over(end)) * 10 + reach;
                if (!best || cost < best.cost) best = { cost, out, mouth: m };
            }
            const { out, mouth } = best;
            mouth.y = CUP_LAY_Y;
            const axis = out.clone().negate();
            const lay = { pos: mouth.clone().addScaledVector(axis, -CUP_H), quat: aimAt(axis) };
            await moveCup(cup, 320, { pos: lay.pos.clone().setY(CUP_LAY_Y + 1.6), quat: lay.quat });
            if (cut()) return;
            await moveCup(cup, 150, lay);
            if (cut()) return;
            const order = onTable.slice().sort((a, b) => dice[a].base.distanceTo(mouth) - dice[b].base.distanceTo(mouth));
            await Promise.all(order.map((slot, i) => animate(i * 77, () => {}).then(() => rollInto(dice[slot], mouth, axis))));
            if (cut()) return;
        }
        slots.forEach(slot => { dice[slot].group.visible = false; });

        // Se levanta boca abajo, se agita y se vuelca hacia el centro de la mesa
        const hold = new THREE.Vector3(from * 1.6, CUP_H + 2, from * 6);
        await moveCup(cup, 340, { pos: hold, quat: MOUTH_DOWN });
        if (cut()) return;
        let nextRattle = 0;
        await animate(560, k => {
            const t = k * 560;
            cup.pos.set(hold.x + Math.sin(t * .045) * .22, hold.y + Math.abs(Math.sin(t * .033)) * .18, hold.z + Math.sin(t * .029) * .12);
            cup.wobble.setFromEuler(new THREE.Euler(Math.sin(t * .05) * .1, 0, Math.sin(t * .04) * .14));
            placeCup(cup);
            if (t >= nextRattle) {
                rattle(1);
                nextRattle = t + 70 + Math.random() * 70;
            }
        });
        if (cut()) return;
        cup.wobble.identity();
        await moveCup(cup, 200, cupPour(from));
        if (cut()) return;

        slots.forEach((slot, k) => {
            const dd = dice[slot];
            // Recién ahora, con los dados dentro del cubilete, el dado visual se gira dentro de su cuerpo físico
            // para que la cara sorteada ocupe el lugar de la que quedó arriba (antes cambiaría la cara que se ve en la mesa)
            dd.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(...normalOf(faces[k])), new THREE.Vector3(...normalOf(sim.up[k])));
            dd.lift = 0;
            dd.group.visible = true;
        });
        const done = new Promise(resolve => {
            playback = { sim, slots, t: reduceMotion ? 1e9 : 0, hit: 0, resolve };
            applyFrame(playback, playback.t);
        });
        rattle(1.2);
        // Vuelve a su sitio, boca abajo, mientras ruedan los dados
        animate(260, () => {}).then(() => cut() || moveCup(cup, 620, cupRest(from)));
        return done;
    }

    // ---------- Marcar y apartar ----------
    function setSelected(selected) {
        dice.forEach(dd => {
            const on = selected.has(dd.slot);
            dd.liftTo = on ? .35 : 0;
            dd.glowTo = on ? 1 : 0;
        });
    }

    let lockCount = 0;
    function lock(slots, from) {
        return Promise.all(slots.map(slot => {
            const dd = dice[slot];
            dd.liftTo = dd.glowTo = 0;
            const a = dd.base.clone(), b = lockSpot(lockCount++, from);
            return animate(420, k => {
                const e = ease(k);
                dd.base.lerpVectors(a, b, e);
                dd.base.y += Math.sin(Math.PI * e) * 1.2;
            });
        }));
    }
    // Dados calientes: la fila de apartados vuelve a empezar (la próxima tirada los recoge a todos)
    const clearLocks = () => { lockCount = 0; };

    // ---------- Clic / toque ----------
    let pickable = () => false;
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const pickAt = e => {
        const r = canvas.getBoundingClientRect();
        ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
        ray.setFromCamera(ndc, camera);
        // El primer dado bajo el puntero, aunque no se pueda marcar: así un clic no atraviesa un dado para tomar el de atrás
        const hit = ray.intersectObjects(dice.filter(dd => dd.group.visible).map(dd => dd.mesh), false)[0];
        return hit ? hit.object.userData.slot : null;
    };
    let down = null;
    canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
    canvas.addEventListener('pointerup', e => {
        if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 8) return;
        down = null;
        const slot = pickAt(e);
        if (slot !== null) onPick(slot);
    });
    canvas.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const slot = pickAt(e);
        canvas.style.cursor = slot !== null && pickable(slot) ? 'pointer' : '';
    });

    // ---------- Cámara: casi cenital, encuadra la zona de juego, las filas de apartados y los cubiletes ----------
    const corners = [];
    for (const x of [-7.9, 7.9]) for (const z of [-7.1, 7.1]) corners.push(new THREE.Vector3(x, 0, z));
    const dir = new THREE.Vector3(0, 1, .3).normalize();
    const p = new THREE.Vector3();
    function resize() {
        const W = canvas.clientWidth, H = canvas.clientHeight;
        renderer.setPixelRatio(maxDpr());
        renderer.setSize(W, H, false);
        camera.aspect = W / H;
        // Margen para el marcador (arriba) y los botones (abajo), según lo que ocupan en pantalla
        const hud = document.querySelector('.hud')?.getBoundingClientRect(), bar = document.querySelector('.actions')?.getBoundingClientRect();
        const top = hud ? 1 - 2 * Math.min(hud.bottom * .6, H * .25) / H : .8;
        const bottom = bar ? 1 - 2 * (H - bar.top + 8) / H : .7;
        for (let dist = 10; dist < 90; dist += .5) {
            camera.position.copy(lookAt).addScaledVector(dir, dist);
            camera.lookAt(lookAt);
            camera.updateProjectionMatrix();
            camera.updateMatrixWorld();
            if (corners.every(c => {
                p.copy(c).project(camera);
                return Math.abs(p.x) < .98 && p.y < top && p.y > -bottom;
            })) break;
        }
    }
    resize();
    addEventListener('resize', resize);

    // ---------- Bucle ----------
    let last = performance.now();
    const glowColor = new THREE.Color('#ffae2e');
    function frame(now) {
        const dt = Math.min(now - last, 100);
        last = now;
        if (playback) {
            playback.t += dt / 1000;
            applyFrame(playback, playback.t);
            if (playback.t >= playback.sim.steps * playback.sim.dt) {
                const { resolve } = playback;
                playback = null;
                resolve();
            }
        }
        for (const a of anims.slice()) {
            a.t = Math.min(1, a.t + dt / a.dur);
            a.fn(a.t);
            if (a.t >= 1) {
                anims.splice(anims.indexOf(a), 1);
                a.resolve();
            }
        }
        const kf = follow(.2, dt);
        dice.forEach(dd => {
            dd.lift += (dd.liftTo - dd.lift) * kf;
            dd.glow += (dd.glowTo - dd.glow) * kf;
            dd.group.position.copy(dd.base);
            dd.group.position.y += dd.lift;
            dd.mats.forEach(m => m.emissive.copy(glowColor).multiplyScalar(dd.glow * .38));
        });
        // Parpadeo suave de la vela
        candle.intensity = 34 + Math.sin(now * .011) * 2 + Math.sin(now * .037) * 1.5;
        renderer.render(scene, camera);
        requestAnimationFrame(frame);
    }

    return {
        ready: shadersReady(renderer, scene, camera).then(() => requestAnimationFrame(frame)),
        setDice,
        reset,
        throwDice,
        setSelected,
        setPickable: fn => { pickable = fn; },
        lock,
        clearLocks,
    };
}
