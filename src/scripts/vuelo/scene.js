// Avión 3D que recorre la página y nubes de fondo.
// Se carga después del primer pintado (ver main.js) para que el texto aparezca sin esperar a Three.js
import * as THREE from 'three';
import { mergeVertices, mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { $, clamp, lerp, ease, reduceMotion, seeded, loadMascot, shadersReady } from './util.js';

export function initScene({ flight, heroSpot, getPlaneW, rebuild }) {
    // ================= AVIÓN 3D =================
    const canvas = $('#planeCanvas');
    let renderer = null;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (err) {
        renderer = null;
    }

    const scene = new THREE.Scene();
    // Cámara ortográfica en píxeles: 1 unidad = 1 px del viewport
    const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -4000, 4000);
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(.6, 1, 1.2);
    scene.add(sun);

    function resizeRenderer() {
        if (!renderer) return;
        const W = document.documentElement.clientWidth, H = innerHeight;
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setSize(W, H, false);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        camera.right = W;
        camera.bottom = -H;
        camera.updateProjectionMatrix();
    }

    // Librea pintada sobre el fuselaje: parabrisas de cabina, ventanas y franja coral.
    // Eje X del canvas = vuelta alrededor del fuselaje (a = ángulo desde arriba); eje Y = largo (nariz arriba).
    function fuselageTexture() {
        const W = 2048, H = 1024;
        const c = document.createElement('canvas');
        c.width = W;
        c.height = H;
        const g = c.getContext('2d');
        const U = a => ((((3 * Math.PI / 2 + a) / (2 * Math.PI)) % 1) + 1) % 1 * W;
        const V = x => (1 - (x + 1.13) / 2.25) * H;
        const wrap = draw => { for (const off of [-W, 0, W]) { g.save(); g.translate(off, 0); draw(); g.restore(); } };
        const radPx = rad => rad / (2 * Math.PI) * W;
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;

        const paint = () => {
        g.fillStyle = '#ffffff';
        g.fillRect(0, 0, W, H);

        // Franja coral, un poco bajo la línea de ventanas
        g.fillStyle = '#F43F5E';
        for (const side of [-1, 1]) {
            const u = U(side * 1.62), half = radPx(.045);
            wrap(() => g.fillRect(u - half, V(.42), half * 2, V(-.4) - V(.42)));
        }

        // Ventanas de pasajeros
        g.fillStyle = '#0284C7';
        const ww = radPx(.17), wh = .042 / 2.25 * H;
        for (const side of [-1, 1]) {
            for (let x = -.5; x <= .66; x += .1) {
                const u = U(side * 1.2), v = V(x);
                wrap(() => { g.beginPath(); g.roundRect(u - ww / 2, v - wh / 2, ww, wh, Math.min(ww, wh) / 2); g.fill(); });
            }
        }

        // Parabrisas: franja que envuelve la nariz y se barre hacia atrás en los costados
        const front = a => 1.055 - .05 * Math.abs(a) / 1.25;
        const rear = a => .975 - .065 * Math.abs(a) / 1.25;
        g.fillStyle = '#1E293B';
        g.beginPath();
        for (let a = -1.25; a <= 1.2501; a += .05) g.lineTo(U(a), V(front(a)));
        for (let a = 1.25; a >= -1.2501; a -= .05) g.lineTo(U(a), V(rear(a)));
        g.closePath();
        g.fill();
        // Marcos entre paneles
        g.strokeStyle = '#ffffff';
        g.lineWidth = 8;
        for (const a of [0, -.5, .5, -.95, .95]) {
            g.beginPath();
            g.moveTo(U(a), V(front(a)) - 4);
            g.lineTo(U(a), V(rear(a)) + 4);
            g.stroke();
        }
        // Reflejo suave en la parte alta de los paneles
        g.fillStyle = 'rgba(148, 197, 233, .35)';
        g.beginPath();
        for (let a = -1.2; a <= 1.2001; a += .05) g.lineTo(U(a), V(front(a)) + 3);
        for (let a = 1.2; a >= -1.2001; a -= .05) g.lineTo(U(a), V(lerp(front(a), rear(a), .35)));
        g.closePath();
        g.fill();

        tex.needsUpdate = true;
        };

        paint();
        return tex;
    }


    // Insignia de la aleta: la mascota dentro de un círculo blanco con el contorno del avión
    function finBadgeTexture() {
        const S = 512;
        const c = document.createElement('canvas');
        c.width = c.height = S;
        const g = c.getContext('2d');
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        const circle = () => {
            g.beginPath();
            g.arc(S / 2, S / 2, S / 2 - 14, 0, Math.PI * 2);
            g.fillStyle = '#ffffff';
            g.fill();
            g.lineWidth = 16;
            g.strokeStyle = '#334155';
            g.stroke();
        };
        circle();
        loadMascot().then(img => {
            const m = S * .58;
            g.imageSmoothingEnabled = false;
            g.drawImage(img, (S - m) / 2, (S - m) / 2, m, m);
            tex.needsUpdate = true;
        }).catch(() => {});
        return tex;
    }

    function buildPlane() {
        const model = new THREE.Group();
        const grad = new THREE.DataTexture(new Uint8Array([120, 195, 255]), 3, 1, THREE.RedFormat);
        grad.minFilter = grad.magFilter = THREE.NearestFilter;
        grad.needsUpdate = true;
        const toon = color => new THREE.MeshToonMaterial({ color, gradientMap: grad });
        // Contorno "dibujado a mano": malla invertida y engordada por la normal
        const outlineMat = new THREE.ShaderMaterial({
            uniforms: { color: { value: new THREE.Color(0x334155) }, thickness: { value: .022 } },
            vertexShader: 'uniform float thickness; void main(){ vec3 p = position + normal * thickness; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
            fragmentShader: 'uniform vec3 color; void main(){ gl_FragColor = vec4(color, 1.0); }',
            side: THREE.BackSide,
        });
        const add = (geo, mat, outline = true) => {
            const mesh = new THREE.Mesh(geo, mat);
            model.add(mesh);
            if (outline) {
                let og = geo.clone();
                og.deleteAttribute('normal');
                if (og.attributes.uv) og.deleteAttribute('uv');
                og = mergeVertices(og);
                og.computeVertexNormals();
                mesh.add(new THREE.Mesh(og, outlineMat));
            }
            return mesh;
        };

        // Fuselaje (torneado y denso) con la cola levantada como un avión de línea
        const ctrl = [[0, -1.13], [.04, -1.12], [.09, -1.06], [.15, -.9], [.2, -.65], [.22, -.35], [.22, .4], [.215, .7], [.19, .9], [.14, 1.02], [.07, 1.09], [0, 1.12]]
            .map(([r, y]) => new THREE.Vector2(r, y));
        const profile = new THREE.SplineCurve(ctrl).getPoints(90).map(p => new THREE.Vector2(Math.max(0, p.x), p.y));
        const body = new THREE.LatheGeometry(profile, 48);
        // La coordenada V de la textura sigue la posición a lo largo del fuselaje
        const uv = body.attributes.uv, bodyPos = body.attributes.position;
        for (let i = 0; i < uv.count; i++) uv.setY(i, (bodyPos.getY(i) + 1.13) / 2.25);
        body.rotateZ(-Math.PI / 2);
        for (let i = 0; i < bodyPos.count; i++) {
            const x = bodyPos.getX(i);
            if (x < -.45) bodyPos.setY(i, bodyPos.getY(i) + (-.45 - x) * .2);
        }
        body.computeVertexNormals();
        const livery = fuselageTexture();
        livery.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
        add(body, new THREE.MeshToonMaterial({ map: livery, gradientMap: grad }));

        // Alas (forma barrida y extruida)
        const wingGeo = (span, root, tip, sweep, thick, sign) => {
            const s = new THREE.Shape();
            s.moveTo(root / 2, 0);
            s.lineTo(root / 2 - sweep, span * sign);
            s.lineTo(root / 2 - sweep - tip, span * sign);
            s.lineTo(-root / 2, 0);
            s.closePath();
            const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: thick * .35, bevelSize: thick * .35, bevelSegments: 1 });
            g.translate(0, 0, -thick / 2);
            g.rotateX(Math.PI / 2);
            return g;
        };
        for (const sign of [-1, 1]) {
            const wing = wingGeo(1.15, .62, .16, .5, .04, sign);
            wing.rotateX(-sign * .08);
            wing.translate(.05, -.1, 0);
            add(wing, toon(0xe2f1f8));

            const stab = wingGeo(.42, .3, .1, .22, .03, sign);
            stab.translate(-.93, .1, 0);
            add(stab, toon(0xe2f1f8));

            // Motores bajo el ala
            const engine = new THREE.CylinderGeometry(.075, .06, .34, 18);
            engine.rotateZ(-Math.PI / 2);
            engine.translate(.2, -.22, sign * .42);
            add(engine, toon(0xcbd5e1));
            const intake = new THREE.CylinderGeometry(.06, .06, .012, 18);
            intake.rotateZ(-Math.PI / 2);
            intake.translate(.372, -.22, sign * .42);
            add(intake, toon(0x334155), false);
            const pylon = new THREE.BoxGeometry(.16, .1, .02);
            pylon.translate(.15, -.15, sign * .42);
            add(pylon, toon(0xcbd5e1), false);
        }

        // Deriva
        const fin = new THREE.Shape();
        fin.moveTo(-.6, .12);
        fin.lineTo(-1.0, .62);
        fin.lineTo(-1.15, .62);
        fin.lineTo(-1.1, .1);
        fin.closePath();
        const finGeo = new THREE.ExtrudeGeometry(fin, { depth: .035, bevelEnabled: true, bevelThickness: .012, bevelSize: .012, bevelSegments: 1 });
        finGeo.translate(0, 0, -.0175);
        add(finGeo, toon(0x38bdf8));

        // Insignia con la mascota en ambos lados de la aleta
        const badgeMat = new THREE.MeshToonMaterial({ map: finBadgeTexture(), gradientMap: grad, transparent: true, alphaTest: .5 });
        for (const side of [-1, 1]) {
            const badge = new THREE.Mesh(new THREE.PlaneGeometry(.23, .23), badgeMat);
            badge.position.set(-.98, .37, side * .031);
            if (side < 0) badge.rotation.y = Math.PI;
            model.add(badge);
        }


        // Punto de donde sale la estela
        const tailAnchor = new THREE.Object3D();
        tailAnchor.position.set(-1.1, .12, 0);
        model.add(tailAnchor);

        return { model, tailAnchor };
    }

    // Jerarquía: posición/escala → inclinación de vista → rumbo → cabeceo → alabeo → modelo
    const root = new THREE.Group();
    const viewTilt = new THREE.Group();
    const heading = new THREE.Group();
    const pitchG = new THREE.Group();
    const rollG = new THREE.Group();
    const { model, tailAnchor } = buildPlane();
    rollG.add(model);
    pitchG.add(rollG);
    heading.add(pitchG);
    viewTilt.add(heading);
    // Giro manual al arrastrar (en ejes de pantalla, antes de todo lo demás)
    const spinG = new THREE.Group();
    spinG.rotation.order = 'YXZ';
    spinG.add(viewTilt);
    root.add(spinG);
    scene.add(root);
    viewTilt.rotation.x = .62; // vemos el avión ligeramente desde arriba

    // Estela: partículas en coordenadas del documento, para que se queden en la página
    const puffGeo = new THREE.SphereGeometry(1, 10, 8);
    const puffs = [];
    for (let i = 0; i < 70; i++) {
        const m = new THREE.Mesh(puffGeo, new THREE.MeshBasicMaterial({ color: 0xd4e8f5, transparent: true, opacity: 0, depthWrite: false }));
        m.visible = false;
        m.userData = { life: 0, docX: 0, docY: 0, vx: 0, vy: 0, size: 0 };
        scene.add(m);
        puffs.push(m);
    }
    let puffIdx = 0, puffClock = 0, lastFlightLen = 0;
    const tmpV = new THREE.Vector3();

    const motion = { yaw: -.42, roll: 0, rollBoost: 0, hopX: 0, hopY: 0, extra: 0, carry: 0, carryX: 0, carryY: 0 };
    const pointer = { x: .5, y: .5 };
    addEventListener('pointermove', e => { pointer.x = e.clientX / innerWidth; pointer.y = e.clientY / innerHeight; });

    // Tonel (barrel roll) al hacer clic
    let barrel = null;
    function barrelRoll() {
        // Un clic (o doble clic) durante el tonel no inicia otro hasta que termine
        if (barrel || reduceMotion) return;
        barrel = { start: performance.now(), dur: 1300 };
    }
    // Si empiezas a arrastrar a mitad del tonel, se corta y vuelve suave a la pose (sin mezclar los dos giros)
    function cancelBarrel() {
        if (!barrel) return;
        barrel = null;
        motion.carry = motion.extra % (Math.PI * 2);
        motion.carryX = motion.hopX;
        motion.carryY = motion.hopY;
    }
    // Arrastrar = girar el avión a mano; clic sin arrastrar = tonel
    const spin = { yaw: 0, pitch: 0, vYaw: 0, vPitch: 0, dragging: false, moved: false, x: 0, y: 0, sx: 0, sy: 0, released: -1e9 };
    heroSpot.addEventListener('pointerdown', e => {
        // Sin esto, un doble clic selecciona texto y el siguiente arrastre se vuelve un arrastre nativo del navegador
        e.preventDefault();
        spin.dragging = true;
        spin.moved = false;
        spin.x = spin.sx = e.clientX;
        spin.y = spin.sy = e.clientY;
        spin.vYaw = spin.vPitch = 0;
        heroSpot.setPointerCapture(e.pointerId);
    });
    heroSpot.addEventListener('pointermove', e => {
        if (!spin.dragging) return;
        if (!spin.moved && Math.hypot(e.clientX - spin.sx, e.clientY - spin.sy) > 6) {
            spin.moved = true;
            heroSpot.classList.add('dragging');
            cancelBarrel();
        }
        if (!spin.moved) return;
        const dYaw = (e.clientX - spin.x) * .012, dPitch = (e.clientY - spin.y) * .012;
        spin.yaw += dYaw;
        spin.pitch += dPitch;
        // Velocidad limitada para que la inercia no lo deje girando como trompo
        spin.vYaw = clamp(lerp(spin.vYaw, dYaw, .5), -.18, .18);
        spin.vPitch = clamp(lerp(spin.vPitch, dPitch, .5), -.18, .18);
        spin.x = e.clientX;
        spin.y = e.clientY;
    });
    const endDrag = e => {
        if (!spin.dragging) return;
        spin.dragging = false;
        heroSpot.classList.remove('dragging');
        if (spin.moved) spin.released = performance.now();
        else if (e.type === 'pointerup') barrelRoll();
    };
    heroSpot.addEventListener('pointerup', endDrag);
    heroSpot.addEventListener('dragstart', e => e.preventDefault());
    heroSpot.addEventListener('pointercancel', endDrag);

    function updateSpin(t) {
        if (spin.dragging) return;
        // Inercia al soltar
        spin.yaw += spin.vYaw;
        spin.pitch += spin.vPitch;
        spin.vYaw *= .93;
        spin.vPitch *= .93;
        // Luego vuelve suave a la pose, por el camino más corto (sin "desenrollar" vueltas)
        const settling = Math.abs(spin.vYaw) + Math.abs(spin.vPitch) < .01;
        if (settling || t - spin.released > 700 || reduceMotion) {
            spin.vYaw *= .85;
            spin.vPitch *= .85;
            const turn = Math.PI * 2;
            spin.yaw += (Math.round(spin.yaw / turn) * turn - spin.yaw) * .06;
            spin.pitch += (Math.round(spin.pitch / turn) * turn - spin.pitch) * .06;
        }
    }
    heroSpot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); barrelRoll(); } });

    function renderPlane(t, dt) {
        if (!renderer) return;
        if (camera.right !== document.documentElement.clientWidth || camera.bottom !== -innerHeight) rebuild();
        const s = flight.scale * getPlaneW() / 2.5;
        const intro = flight.intro;

        // Rumbo: de lado con 3/4 hacia la cámara; gira de verdad al cambiar de dirección
        const heroLook = (1 - intro);
        let yawTarget = flight.dir > 0 ? -.42 : -Math.PI + .42;
        yawTarget += heroLook * (pointer.x - .5) * .5;
        const prevYaw = motion.yaw;
        motion.yaw += (yawTarget - motion.yaw) * (reduceMotion ? 1 : .06);
        const yawVel = (motion.yaw - prevYaw) / Math.max(dt, 1);
        heading.rotation.y = motion.yaw;

        // Cabeceo: sube en el hero, sigue la ruta al viajar, mira un poco al cursor
        const bob = reduceMotion ? 0 : Math.sin(t * .0011);
        pitchG.rotation.z = .1 * heroLook + flight.pitch - heroLook * (pointer.y - .5) * .3 + bob * .03;

        // Alabeo: se inclina en las curvas + vaivén suave + tonel
        const bankTarget = clamp(-yawVel * 260, -.9, .9);
        motion.roll += (bankTarget - motion.roll) * .1;
        let extraRoll = 0, hopX = 0, hopY = 0;
        if (barrel) {
            const k = clamp((t - barrel.start) / barrel.dur, 0, 1);
            const e = ease(k);
            extraRoll = e * Math.PI * 2;
            hopY = Math.sin(k * Math.PI) * 60;
            hopX = Math.sin(k * Math.PI) * 40 * flight.dir;
            if (k >= 1) barrel = null;
        } else {
            // Restos de un tonel interrumpido: se asientan en la vuelta completa más cercana
            const turn = Math.PI * 2;
            motion.carry += (Math.round(motion.carry / turn) * turn - motion.carry) * .1;
            motion.carryX *= .85;
            motion.carryY *= .85;
            extraRoll = motion.carry;
            hopX = motion.carryX;
            hopY = motion.carryY;
        }
        motion.extra = extraRoll;
        motion.hopX = hopX;
        motion.hopY = hopY;
        rollG.rotation.x = motion.roll + (reduceMotion ? 0 : Math.sin(t * .0008) * .06) + extraRoll;

        updateSpin(t);
        spinG.rotation.y = spin.yaw;
        spinG.rotation.x = spin.pitch;

        const vx = flight.x - scrollX + hopX * flight.scale;
        const vy = flight.y - scrollY - (hopY + bob * 10) * flight.scale;
        root.position.set(vx, -vy, 0);
        root.scale.setScalar(s);

        // Estela: solo cuando el avión se desplaza (quieto se acumulaba como un brillo)
        const moving = Math.abs(flight.len - lastFlightLen) > .6 || barrel;
        lastFlightLen = flight.len;
        puffClock += dt;
        if (!reduceMotion && moving && puffClock > 28) {
            puffClock = 0;
            root.updateMatrixWorld(true);
            tailAnchor.getWorldPosition(tmpV);
            const m = puffs[puffIdx];
            puffIdx = (puffIdx + 1) % puffs.length;
            const back = -Math.cos(motion.yaw);
            m.userData = {
                life: 1,
                docX: tmpV.x + scrollX,
                docY: -tmpV.y + scrollY,
                vx: back * (.05 + Math.random() * .03),
                vy: (Math.random() - .5) * .02,
                size: (4 + Math.random() * 3) * flight.scale,
            };
            m.visible = true;
        }
        for (const m of puffs) {
            const u = m.userData;
            if (u.life <= 0) { m.visible = false; continue; }
            u.life -= dt / 1100;
            u.docX += u.vx * dt;
            u.docY += u.vy * dt;
            m.position.set(u.docX - scrollX, -(u.docY - scrollY), -300);
            m.scale.setScalar(u.size * (1 + (1 - u.life) * 1.6));
            m.material.opacity = Math.max(0, u.life) * .5;
        }

        renderer.render(scene, camera);
    }

    if (!renderer) {
        $('#planeFallback').classList.remove('hidden');
        canvas.remove();
    }

    // ================= NUBES 3D DE FONDO =================
    // Nubes ilustradas (esferas fusionadas, sombreado toon y contorno suave) con parallax al hacer scroll
    const cloudCanvas = $('#cloudCanvas');
    let cloudRenderer = null;
    try {
        cloudRenderer = new THREE.WebGLRenderer({ canvas: cloudCanvas, alpha: true, antialias: true });
    } catch (err) {
        cloudRenderer = null;
        cloudCanvas.remove();
    }
    const cloudScene = new THREE.Scene();
    const cloudCam = new THREE.OrthographicCamera(0, 1, 0, -1, -4000, 4000);
    cloudScene.add(new THREE.HemisphereLight(0xffffff, 0xc4dff0, 1.5));
    const cloudSun = new THREE.DirectionalLight(0xffffff, 1.6);
    cloudSun.position.set(.3, 1, .8);
    cloudScene.add(cloudSun);

    const cloudGrad = new THREE.DataTexture(new Uint8Array([150, 215, 255]), 3, 1, THREE.RedFormat);
    cloudGrad.minFilter = cloudGrad.magFilter = THREE.NearestFilter;
    cloudGrad.needsUpdate = true;


    function cloudGeometry(seed) {
        const rand = seeded(seed);
        const puffs = [[0, .05, 0, .5], [-.46, -.06, .05, .36], [.46, -.08, -.05, .38], [-.2, .24, -.08, .34], [.24, .2, .08, .32], [-.78, -.14, 0, .24], [.8, -.15, .02, .24]];
        const geos = puffs.map(([x, y, z, r]) => {
            const g = new THREE.SphereGeometry(r * (.85 + rand() * .3), 22, 16);
            g.translate(x + (rand() - .5) * .1, y + (rand() - .5) * .08, z);
            return g;
        });
        const geo = mergeGeometries(geos);
        // Base plana, como las nubes de ilustración
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            if (y < -.2) pos.setY(i, -.2 + (y + .2) * .25);
        }
        geo.computeVertexNormals();
        return geo;
    }

    // [x, y] en fracción del viewport, ancho en px, profundidad (0 = lejos, 1 = cerca)
    const CLOUDS = [
        [.06, .2, 250, .75], [.6, .1, 170, .3], [.9, .46, 290, .95], [.32, .6, 140, .15],
        [.74, .8, 210, .5], [.14, .9, 260, .8], [.5, .38, 130, .1], [.97, .14, 150, .25], [.4, .98, 190, .45],
    ];
    const paper = new THREE.Color(0xf6f3ec);
    const clouds = CLOUDS.map(([x, y, size, depth], i) => {
        const geo = cloudGeometry(i * 97 + 13);
        const body = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color: new THREE.Color(0xffffff).lerp(paper, (1 - depth) * .7), gradientMap: cloudGrad }));
        let og = geo.clone();
        og.deleteAttribute('normal');
        og.deleteAttribute('uv');
        og = mergeVertices(og);
        og.computeVertexNormals();
        const outline = new THREE.Mesh(og, new THREE.ShaderMaterial({
            uniforms: { color: { value: new THREE.Color(0xcde0ee).lerp(new THREE.Color(0xeaf1f6), 1 - depth) }, thickness: { value: .011 } },
            vertexShader: 'uniform float thickness; void main(){ vec3 p = position + normal * thickness; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
            fragmentShader: 'uniform vec3 color; void main(){ gl_FragColor = vec4(color, 1.0); }',
            side: THREE.BackSide,
        }));
        body.add(outline);
        body.rotation.x = .18;
        body.scale.setScalar(size * .85 / 1.9);
        cloudScene.add(body);
        return { obj: body, outline, x, y, size, depth, phase: i * 1.7 };
    });
    // De noche las nubes toman el azul de la luna (más oscuras mientras más lejos)
    function setCloudTheme(dark) {
        for (const c of clouds) {
            const far = 1 - c.depth;
            c.obj.material.color.set(dark ? 0x4a5d80 : 0xffffff).lerp(dark ? new THREE.Color(0x2b3a57) : paper, far * .7);
            c.outline.material.uniforms.color.value.set(dark ? 0x6880a8 : 0xcde0ee).lerp(new THREE.Color(dark ? 0x34456a : 0xeaf1f6), far);
        }
    }

    const wrapMod = (a, n) => ((a % n) + n) % n;
    let cloudW = 0, cloudH = 0;
    function renderClouds(t) {
        if (!cloudRenderer) return;
        const W = document.documentElement.clientWidth, H = innerHeight;
        if (W !== cloudW || H !== cloudH) {
            cloudW = W;
            cloudH = H;
            cloudRenderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
            cloudRenderer.setSize(W, H, false);
            cloudCanvas.style.width = W + 'px';
            cloudCanvas.style.height = H + 'px';
            cloudCam.right = W;
            cloudCam.bottom = -H;
            cloudCam.updateProjectionMatrix();
        }
        for (const c of clouds) {
            const span = c.size + 160;
            // Las cercanas se mueven más con el scroll y derivan más rápido
            const drift = reduceMotion ? 0 : lerp(5, 16, c.depth) * t / 1000;
            const x = wrapMod(c.x * W + drift, W + span) - span / 2;
            const y = wrapMod(c.y * H - scrollY * lerp(.12, .5, c.depth), H + span) - span / 2;
            c.obj.position.set(x, -y, -400 + c.depth * 200);
            c.obj.rotation.y = reduceMotion ? 0 : Math.sin(t * .00015 + c.phase) * .4;
        }
        cloudRenderer.render(cloudScene, cloudCam);
    }

    // Shaders compilados en paralelo: el primer frame no traba la página
    const ready = Promise.all([
        renderer ? shadersReady(renderer, scene, camera) : null,
        cloudRenderer ? shadersReady(cloudRenderer, cloudScene, cloudCam) : null,
    ]);
    return { renderPlane, renderClouds, resizeRenderer, setCloudTheme, barrelRoll, ready };
}
