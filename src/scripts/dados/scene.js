// Mesa 3D: tablero de madera, dados con caras pintadas en canvas y reproducción de las tiradas grabadas por physics.js
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { seeded, shadersReady, maxDpr, reduceMotion, follow, ease } from '../vuelo/util.js';
import { TRAY, FACE_VALUES, normalOf, simulateThrow } from './physics.js';
import { clack } from './sound.js';

const RIM = .8, RIM_H = .8;
// Fila donde se apartan los dados guardados, fuera del tablero del lado de quien tira
const lockSpot = (k, from) => new THREE.Vector3(-3.1 + k * 1.25, .5, from * (TRAY.d / 2 + RIM + 1.05));

// ---------- Texturas ----------
function woodCanvas(seed, w, h, light, dark, planks = 0) {
    const rand = seeded(seed);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    g.fillStyle = light;
    g.fillRect(0, 0, w, h);
    // Vetas: líneas onduladas a lo largo
    for (let i = 0; i < 260; i++) {
        const y0 = rand() * h, amp = 2 + rand() * 9, freq = .002 + rand() * .01, ph = rand() * 6;
        g.strokeStyle = dark;
        g.globalAlpha = .04 + rand() * .12;
        g.lineWidth = .6 + rand() * 2.4;
        g.beginPath();
        for (let x = 0; x <= w; x += 8) g.lineTo(x, y0 + Math.sin(x * freq + ph) * amp + Math.sin(x * freq * 3.1) * amp * .3);
        g.stroke();
    }
    // Nudos
    for (let i = 0; i < 5; i++) {
        const x = rand() * w, y = rand() * h, r = 6 + rand() * 14;
        for (let k = 0; k < 5; k++) {
            g.globalAlpha = .12;
            g.beginPath();
            g.ellipse(x, y, r * 2.4 + k * 6, r + k * 3, 0, 0, 7);
            g.stroke();
        }
    }
    g.globalAlpha = 1;
    // Juntas de tablones
    for (let i = 1; i < planks; i++) {
        const y = h * i / planks;
        g.fillStyle = 'rgba(20,10,4,.55)';
        g.fillRect(0, y - 1.5, w, 3);
        g.fillStyle = 'rgba(255,230,190,.08)';
        g.fillRect(0, y + 1.5, w, 2);
    }
    return c;
}

const PIPS = {
    1: [[.5, .5]],
    2: [[.27, .27], [.73, .73]],
    3: [[.27, .27], [.5, .5], [.73, .73]],
    4: [[.27, .27], [.73, .27], [.27, .73], [.73, .73]],
    5: [[.27, .27], [.73, .27], [.5, .5], [.27, .73], [.73, .73]],
    6: [[.27, .25], [.73, .25], [.27, .5], [.73, .5], [.27, .75], [.73, .75]],
};

function devilHead(g, S, color) {
    g.save();
    g.translate(S / 2, S / 2 + 8);
    g.fillStyle = color;
    // Cuernos
    for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(s * 38, -40);
        g.quadraticCurveTo(s * 70, -70, s * 58, -104);
        g.quadraticCurveTo(s * 50, -66, s * 18, -54);
        g.fill();
    }
    // Cara
    g.beginPath();
    g.moveTo(-54, -44);
    g.quadraticCurveTo(-60, 30, 0, 66);
    g.quadraticCurveTo(60, 30, 54, -44);
    g.quadraticCurveTo(0, -70, -54, -44);
    g.fill();
    // Ojos y sonrisa
    g.fillStyle = '#f2c14e';
    for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(s * 10, -14);
        g.lineTo(s * 40, -24);
        g.lineTo(s * 30, -4);
        g.closePath();
        g.fill();
    }
    g.strokeStyle = '#f2c14e';
    g.lineWidth = 6;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-26, 22);
    g.quadraticCurveTo(0, 42, 26, 22);
    g.stroke();
    g.restore();
}

const faceCache = new Map();
function faceTexture(die, value, renderer) {
    const key = `${die.id}:${value}`;
    if (faceCache.has(key)) return faceCache.get(key);
    const S = 256;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    g.fillStyle = die.body;
    g.fillRect(0, 0, S, S);
    // Desgaste: un poco más oscuro hacia los bordes
    const vg = g.createRadialGradient(S / 2, S / 2, S * .2, S / 2, S / 2, S * .75);
    vg.addColorStop(0, 'rgba(255,255,255,.06)');
    vg.addColorStop(1, 'rgba(0,0,0,.22)');
    g.fillStyle = vg;
    g.fillRect(0, 0, S, S);
    const rand = seeded(value * 97 + die.id.length * 13);
    for (let i = 0; i < 400; i++) {
        g.fillStyle = rand() < .5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.05)';
        g.fillRect(rand() * S, rand() * S, 1 + rand() * 2, 1 + rand() * 2);
    }
    if (die.joker === 'one' && value === 1) devilHead(g, S, die.pip);
    else {
        const r = value === 1 ? 30 : 22;
        for (const [x, y] of PIPS[value]) {
            // Hoyuelo: borde claro abajo, centro oscuro
            g.fillStyle = 'rgba(255,255,255,.25)';
            g.beginPath();
            g.arc(x * S + 1.5, y * S + 2.5, r, 0, 7);
            g.fill();
            const pg = g.createRadialGradient(x * S - r * .3, y * S - r * .3, 1, x * S, y * S, r);
            pg.addColorStop(0, die.pip);
            pg.addColorStop(1, shade(die.pip, -.35));
            g.fillStyle = pg;
            g.beginPath();
            g.arc(x * S, y * S, r, 0, 7);
            g.fill();
        }
        if (die.joker === 'all') {
            // Marca de bufón en la esquina
            g.fillStyle = die.pip;
            g.font = 'bold 34px serif';
            g.textAlign = 'center';
            g.fillText('★', S - 34, S - 18);
        }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    faceCache.set(key, tex);
    return tex;
}

// Aclara (+) u oscurece (-) un color hex
function shade(hex, k) {
    const c = new THREE.Color(hex);
    return k < 0 ? '#' + c.multiplyScalar(1 + k).getHexString() : '#' + c.lerp(new THREE.Color('#fff'), k).getHexString();
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
    scene.fog = new THREE.Fog('#140d08', 26, 48);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;

    const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
    const lookAt = new THREE.Vector3(0, 0, .3);

    // ---------- Luces: vela cálida y algo de relleno ----------
    scene.add(new THREE.HemisphereLight('#ffdcb0', '#2a1608', .55));
    const sun = new THREE.DirectionalLight('#ffd7a3', 2.2);
    sun.position.set(-4, 14, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 10, bottom: -10, near: 1, far: 40 });
    sun.shadow.bias = -.0005;
    sun.shadow.radius = 4;
    scene.add(sun);
    const candle = new THREE.PointLight('#ff9a3c', 30, 30, 1.6);
    candle.position.set(7.5, 4, -5.5);
    scene.add(candle);

    // ---------- Mesa y tablero ----------
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const woodTex = (seed, w, h, light, dark, planks, repeat) => {
        const t = new THREE.CanvasTexture(woodCanvas(seed, w, h, light, dark, planks));
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = maxAniso;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(...repeat);
        return t;
    };
    const table = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 40),
        new THREE.MeshStandardMaterial({ map: woodTex(5, 1024, 512, '#4a2d18', '#1c0f06', 6, [4, 4]), roughness: .75, envMapIntensity: .25 }),
    );
    table.rotation.x = -Math.PI / 2;
    table.position.y = -.01;
    table.receiveShadow = true;
    scene.add(table);

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(TRAY.w, TRAY.d),
        new THREE.MeshStandardMaterial({ map: woodTex(11, 1024, 683, '#9a6a3c', '#4a2a12', 5, [1, 1]), roughness: .7, envMapIntensity: .3 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const rimMat = new THREE.MeshStandardMaterial({ map: woodTex(23, 1024, 128, '#5a3418', '#1a0c04', 0, [2, 1]), roughness: .6, envMapIntensity: .35 });
    const { w, d } = TRAY;
    for (const [x, z, sx, sz] of [[0, -d / 2 - RIM / 2, w + RIM * 2, RIM], [0, d / 2 + RIM / 2, w + RIM * 2, RIM], [-w / 2 - RIM / 2, 0, RIM, d], [w / 2 + RIM / 2, 0, RIM, d]]) {
        const rim = new THREE.Mesh(new RoundedBoxGeometry(sx, RIM_H, sz, 2, .12), rimMat);
        rim.position.set(x, RIM_H / 2, z);
        rim.castShadow = rim.receiveShadow = true;
        scene.add(rim);
    }

    // ---------- Dados ----------
    const geo = new RoundedBoxGeometry(1, 1, 1, 5, .14);
    const dice = [...Array(6)].map((_, slot) => {
        const mats = FACE_VALUES.map(() => new THREE.MeshStandardMaterial({ roughness: .38, metalness: 0, envMapIntensity: .6, emissive: '#000' }));
        const mesh = new THREE.Mesh(geo, mats);
        mesh.castShadow = mesh.receiveShadow = true;
        mesh.userData.slot = slot;
        const group = new THREE.Group();
        group.add(mesh);
        group.visible = false;
        scene.add(group);
        return { slot, group, mesh, mats, lift: 0, liftTo: 0, glow: 0, glowTo: 0, base: new THREE.Vector3() };
    });

    function setDice(defs) {
        dice.forEach((dd, i) => dd.mats.forEach((m, k) => {
            m.map = faceTexture(defs[i], FACE_VALUES[k], renderer);
            m.needsUpdate = true;
        }));
    }

    function reset() {
        dice.forEach(dd => {
            dd.group.visible = false;
            dd.liftTo = dd.glowTo = 0;
        });
        lockCount = 0;
        tweens.length = 0;
        playback = null;
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

    // Tira los dados de slots; faces: cara que debe quedar arriba en cada uno. from: 1 = jugador, -1 = rival
    function throwDice(slots, faces, from) {
        const sim = simulateThrow(slots.length, from);
        slots.forEach((slot, k) => {
            const dd = dice[slot];
            // El dado visual se gira dentro de su cuerpo físico para que la cara sorteada ocupe el lugar de la que quedó arriba
            dd.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(...normalOf(faces[k])), new THREE.Vector3(...normalOf(sim.up[k])));
            dd.group.visible = true;
            dd.liftTo = dd.lift = dd.glowTo = 0;
        });
        return new Promise(resolve => {
            playback = { sim, slots, t: reduceMotion ? 1e9 : 0, hit: 0, resolve };
            applyFrame(playback, playback.t);
        });
    }

    // ---------- Marcar y apartar ----------
    function setSelected(selected) {
        dice.forEach(dd => {
            const on = selected.has(dd.slot);
            dd.liftTo = on ? .35 : 0;
            dd.glowTo = on ? 1 : 0;
        });
    }

    const tweens = [];
    let lockCount = 0;
    function lock(slots, from) {
        const dur = reduceMotion ? 1 : 420;
        return Promise.all(slots.map(slot => new Promise(resolve => {
            const dd = dice[slot];
            dd.liftTo = dd.glowTo = 0;
            tweens.push({ dd, from: dd.base.clone(), to: lockSpot(lockCount++, from), t: 0, dur, resolve });
        })));
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
        const hit = ray.intersectObjects(dice.filter(dd => dd.group.visible && pickable(dd.slot)).map(dd => dd.mesh), false)[0];
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
        canvas.style.cursor = pickAt(e) !== null ? 'pointer' : '';
    });

    // ---------- Cámara: encuadra el tablero y las dos filas de apartados ----------
    const corners = [];
    for (const x of [-w / 2 - RIM, w / 2 + RIM]) for (const z of [-d / 2 - RIM - 1.7, d / 2 + RIM + 1.7]) for (const y of [0, 1]) corners.push(new THREE.Vector3(x, y, z));
    const dir = new THREE.Vector3(0, 1, .58).normalize();
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
        for (let dist = 10; dist < 80; dist += .5) {
            camera.position.copy(lookAt).addScaledVector(dir, dist);
            camera.lookAt(lookAt);
            camera.updateProjectionMatrix();
            camera.updateMatrixWorld();
            if (corners.every(c => {
                p.copy(c).project(camera);
                return Math.abs(p.x) < .96 && p.y < top && p.y > -bottom;
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
        for (let i = tweens.length - 1; i >= 0; i--) {
            const tw = tweens[i];
            tw.t = Math.min(1, tw.t + dt / tw.dur);
            const k = ease(tw.t);
            tw.dd.base.lerpVectors(tw.from, tw.to, k);
            tw.dd.base.y += Math.sin(Math.PI * k) * 1.2;
            if (tw.t >= 1) {
                tweens.splice(i, 1);
                tw.resolve();
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
        candle.intensity = 30 + Math.sin(now * .011) * 2 + Math.sin(now * .037) * 1.5;
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
