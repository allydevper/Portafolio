// Home "Vuelo WA-2015": ruta del avión, escenas 3D y animaciones de cada escala
import * as THREE from 'three';
import { mergeVertices, mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { $, clamp, lerp, ease, reduceMotion, seeded, loadMascot } from './util.js';

// ================= DATOS =================
const FILTERS = [
    { k: 'all', label: 'Todos' },
    { k: 'java', label: 'Java · Spring' },
    { k: 'net', label: 'C# · .NET' },
    { k: 'front', label: 'Front' },
];

// Orden cronológico: la ventanilla va del amanecer (2018) a la noche (2025)
const PROJECTS = [
    { num: '06', year: '2018', title: 'Tiempo real y portal de gestión', sub: 'WebSockets y back-office travel', role: 'Software Developer',
      stack: ['C#', '.NET', 'SQL Server', 'ASP.NET', 'JavaScript'], metric: 'REST + WS en prod', tags: ['net'],
      sky: { bg: 'linear-gradient(180deg,#f7b9a8 0%,#fbd3a1 55%,#fde6c0 100%)', sun: '#fff3d6', sunTop: 58, ground: '#c98b7a', ink: '#7c2d12', label: 'Madrugada' } },
    { num: '05', year: '2020', title: 'Integraciones GDS y capa Angular', sub: 'Sabre 360 / Sabre, Amadeus y .NET', role: 'Software Engineer',
      stack: ['Angular', 'C#', '.NET', 'REST', 'Sabre 360', 'Amadeus', 'Kontrol'], metric: 'SQL Server + APIs internas', tags: ['net', 'front'],
      sky: { bg: 'linear-gradient(180deg,#9ed2f0 0%,#cfe9f7 60%,#eef7fb 100%)', sun: '#fff7d1', sunTop: 32, ground: '#8fb7a2', ink: '#0c4a6e', label: 'Mañana' } },
    { num: '04', year: '2022', title: 'Capa front emisión y Sabre 360', sub: 'TypeScript en el stack actual', role: 'Sr. Software Engineer',
      stack: ['TypeScript', 'React', 'Tailwind', 'Sabre 360'], metric: 'TypeScript · React · Tailwind', tags: ['front'],
      sky: { bg: 'linear-gradient(180deg,#4f9fe0 0%,#9fd0f2 60%,#d9eefa 100%)', sun: '#fffbe6', sunTop: 16, ground: '#7aa58d', ink: '#ffffff', label: 'Mediodía' } },
    { num: '03', year: '2023', title: 'Servicios de emisión Sabre y Amadeus', sub: 'Emisión, void y refund', role: 'Sr. Software Engineer',
      stack: ['Java', 'Spring Boot', 'Sabre 360', 'Amadeus', 'IATA BSP'], metric: 'Emisión · void · refund', tags: ['java'],
      sky: { bg: 'linear-gradient(180deg,#7fb6e0 0%,#f3d9a4 70%,#f7c98b 100%)', sun: '#ffe7a3', sunTop: 42, ground: '#a3886a', ink: '#ffffff', label: 'Tarde' } },
    { num: '02', year: '2024', title: 'NDC Sabre y pago directo', sub: 'APIs NDC, checkout y touchless', role: 'Sr. Software Engineer',
      stack: ['Java', 'Spring Boot', 'Sabre NDC'], metric: 'NDC + touchless', tags: ['java'],
      sky: { bg: 'linear-gradient(180deg,#5b4b8a 0%,#e0729a 55%,#f6a96b 100%)', sun: '#ffd29a', sunTop: 60, ground: '#5e3d5a', ink: '#ffffff', label: 'Atardecer' } },
    { num: '01', year: '2025', title: 'Gestión y migración de emisión WildFly → Spring Boot', sub: 'Core de emisión en Java moderno', role: 'Tech Lead',
      stack: ['Java', 'Spring Boot', 'Maven'], metric: 'Equipo de 6 · mentoría a 4 devs', tags: ['java'],
      sky: { bg: 'linear-gradient(180deg,#0b1736 0%,#1d2f5e 60%,#2e4373 100%)', sun: '#f1f5f9', sunTop: 22, ground: '#111a33', ink: '#ffffff', label: 'Noche', stars: true } },
];


const ESCALAS = [
    { years: '2015 — 2018', role: 'Software Developer', place: 'Agencia · primer trabajo en travel', color: '#E07A5F', w: 136, h: 124,
      stickers: [{ t: 'C#', bg: '#FDE68A', x: 14, y: 22, r: -8 }, { t: 'LIM', bg: '#BBF7D0', x: 58, y: 64, r: 6 }],
      desc: 'Primeros años en travel: casi todo en C#, mantenimiento de sistemas legacy, documentación, soporte a operación y un portal web de gestión interno.',
      loot: ['Mantenimiento y correcciones en código legacy C# / .NET', 'Documentación técnica y funcional; soporte a usuarios y a otros equipos', 'Desarrollo y evolución del portal web de gestión (back-office)'],
      stack: ['C#', '.NET', 'SQL Server', 'ASP.NET', 'JavaScript', 'jQuery'] },
    { years: '2018 — 2022', role: 'Software Engineer', place: 'Travel Tech · agencia mayorista', color: '#F2CC8F', w: 120, h: 162,
      stickers: [{ t: 'GDS', bg: '#E2F1F8', x: 12, y: 30, r: 6 }, { t: 'Angular', bg: '#FBCFE8', x: 10, y: 92, r: -8 }],
      desc: 'Integraciones GDS (Sabre 360 / Sabre, Amadeus), Angular sobre APIs y microservicios .NET, y WebSockets para mantenimiento y otros flujos.',
      loot: ['Sabre 360 / Sabre y Amadeus: disponibilidad, emisión y sync de PNR; vuelos, hoteles y autos', 'Angular consumiendo REST entre microservicios C# / .NET; WebSockets en servicios de tiempo real'],
      stack: ['C#', '.NET', 'SQL Server', 'Angular', 'REST', 'Sabre 360', 'Amadeus'] },
    { years: '2022 — hoy', role: 'Sr. Software Engineer / Tech Lead', place: 'Travel Tech · empresa actual', color: '#81B29A', w: 196, h: 138,
      stickers: [{ t: 'NDC', bg: '#FBCFE8', x: 16, y: 26, r: -6 }, { t: 'Java', bg: '#FDE68A', x: 84, y: 22, r: 7 }, { t: 'Lead', bg: '#fff', x: 112, y: 70, r: -4 }],
      desc: 'Dirijo a 6 personas directamente; lideré la migración WildFly → Spring Boot y el stack de emisión Sabre / Amadeus con APIs NDC y pagos.',
      loot: ['Responsable principal de la migración del proyecto de emisión de WildFly a Spring Boot', 'Emisión Sabre y Amadeus: NDC, pago directo y touchless', 'Pases a producción; coordinación PCI con el cliente; librerías Maven internas', 'Mentor de 4 desarrolladores junior / mid: code reviews, pair, on-call'],
      stack: ['Java', 'Spring Boot', 'Maven', 'TypeScript', 'Sabre NDC', 'Amadeus', 'Sabre 360'] },
];

// ================= RUTA DE VUELO =================
const heroSpot = $('#heroPlaneSpot');
const planeLayer = $('#planeCanvas');
const hint = $('#planeHint');
const trailSvg = $('#flightTrail');
const routePaths = ['#routeFuture', '#routeWash', '#routeDone', '#routeMaskPath'].map(s => $(s));
const maskPath = $('#routeMaskPath');

let samples = [], total = 1, startPt = null, endPt = null;
let planeW = 0, travelScale = .36;
const flight = { len: 0, scale: 1, dir: 1, travelDir: 1, pitch: 0, intro: 0, x: 0, y: 0 };

function buildFlightPath() {
    trailSvg.style.height = '0px';
    const W = document.documentElement.clientWidth;
    const H = document.documentElement.scrollHeight;
    trailSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    trailSvg.style.width = W + 'px';
    trailSvg.style.height = H + 'px';

    planeW = heroSpot.getBoundingClientRect().width;
    travelScale = W < 768 ? .42 : .36;
    const margin = planeW * travelScale / 2 + 10;

    const pts = [...document.querySelectorAll('[data-waypoint]')].map(el => {
        const r = el.getBoundingClientRect();
        const x = el.dataset.wx ? clamp(W * parseFloat(el.dataset.wx), margin, W - margin) : r.left + scrollX + r.width / 2;
        return { x, y: r.top + scrollY + r.height / 2 };
    }).sort((a, b) => a.y - b.y);

    // Curvas en S: los puntos de control mantienen la Y siempre creciente
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], dy = b.y - a.y;
        d += ` C ${a.x} ${a.y + dy * .5}, ${b.x} ${b.y - dy * .5}, ${b.x} ${b.y}`;
    }
    routePaths.forEach(p => p.setAttribute('d', d));

    const path = routePaths[0];
    total = path.getTotalLength();
    const N = Math.max(300, Math.round(total / 6));
    samples = [];
    for (let i = 0; i <= N; i++) {
        const l = total * i / N, p = path.getPointAtLength(l);
        samples.push({ l, x: p.x, y: p.y });
    }
    maskPath.style.strokeDasharray = `${total} ${total}`;
    startPt = pts[0];
    endPt = pts[pts.length - 1];
}

function lenAtY(y) {
    const n = samples.length - 1;
    if (y <= samples[0].y) return 0;
    if (y >= samples[n].y) return total;
    let lo = 0, hi = n;
    while (hi - lo > 1) {
        const m = (lo + hi) >> 1;
        if (samples[m].y < y) lo = m; else hi = m;
    }
    const a = samples[lo], b = samples[hi];
    return lerp(a.l, b.l, (y - a.y) / ((b.y - a.y) || 1));
}

function pointAt(l) {
    const n = samples.length - 1;
    const f = clamp(l / total, 0, 1) * n;
    const i = Math.min(n - 1, Math.floor(f)), t = f - i;
    const a = samples[i], b = samples[i + 1];
    const p0 = samples[Math.max(0, i - 2)], p1 = samples[Math.min(n, i + 3)];
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), dx: p1.x - p0.x, dy: p1.y - p0.y };
}

// Calcula dónde está el avión (coordenadas del documento) según el scroll
// En el perfil de ascenso, el avión se engancha a la curva del gráfico mientras cruza la pantalla
let climbLen = 0;
function climbFlight(vh) {
    const svg = document.getElementById('climbChart');
    const line = document.getElementById('climbLine');
    if (!svg || !line) return null;
    const r = svg.getBoundingClientRect();
    const u = clamp((vh * .78 - r.top) / (vh * .43 + r.height), 0, 1);
    const w = clamp(Math.min(u, 1 - u) * 7, 0, 1); // entrada y salida suaves
    const t = clamp((u - .12) / .6, 0, 1); // llega a HOY antes de soltar la curva
    climbLen ||= line.getTotalLength();
    if (w <= 0) return { w: 0, t }; // fuera de pantalla: solo sirve para la estela
    const s = r.width / svg.viewBox.baseVal.width, l = t * climbLen;
    const a = line.getPointAtLength(l);
    // Tangente con algo de anticipación: la nariz sube justo al empezar cada ascenso
    const p0 = line.getPointAtLength(Math.max(0, l - 15));
    const p1 = line.getPointAtLength(Math.min(climbLen, l + 35));
    return { x: r.left + scrollX + a.x * s, y: r.top + scrollY + a.y * s, dx: p1.x - p0.x, dy: p1.y - p0.y, w, t, exit: u > .5 };
}

function updateFlight() {
    if (!samples.length) return;
    const sy = scrollY, vh = innerHeight;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);

    // Al inicio el avión está quieto en el hero; luego se ancla al 45% de la pantalla
    const intro = ease(clamp(sy / 420, 0, 1));
    let anchor = lerp(startPt.y, vh * .45, intro);
    // Al final, aterriza junto al pie de página
    const outroSpan = vh * .9;
    const outro = ease(clamp((sy - (maxScroll - outroSpan)) / outroSpan, 0, 1));
    anchor = lerp(anchor, endPt.y - maxScroll, outro);

    const targetLen = lenAtY(clamp(sy + anchor, startPt.y, endPt.y));
    const k = reduceMotion ? 1 : .12;
    const delta = targetLen - flight.len;
    if (Math.abs(delta) > 3) flight.travelDir = Math.sign(delta);
    flight.len += delta * k;
    const climb = climbFlight(vh);
    const climbShrink = climb && innerWidth < 768 ? lerp(1, .6, climb.w) : 1;
    flight.scale += (lerp(1, travelScale, intro) * climbShrink - flight.scale) * k;
    flight.intro = intro;

    const p = pointAt(flight.len);
    let mx = p.dx * flight.travelDir, my = p.dy * flight.travelDir;
    let fx = p.x, fy = p.y;
    if (climb && climb.w > 0) {
        fx = lerp(p.x, climb.x, climb.w);
        fy = lerp(p.y, climb.y, climb.w);
        if (climb.w >= 1) { mx = climb.dx * flight.travelDir; my = climb.dy * flight.travelDir; }
        else {
            // Entrando o saliendo del gráfico: mira hacia donde realmente se mueve
            // (al salir regresa hacia la ruta original, aunque eso sea hacia atrás)
            const k = (climb.exit ? 1 : -1) * flight.travelDir;
            mx = (p.x - climb.x) * k;
            my = (p.y - climb.y) * k;
        }
    }
    // Mira hacia donde vuela; al volver al hero siempre se reorienta a la derecha
    if (intro < .2) flight.dir = 1;
    else if (Math.abs(mx) > 1.5) flight.dir = Math.sign(mx);
    // Se nivela al aterrizar
    // En el perfil de ascenso cabecea de verdad, siguiendo la pendiente del gráfico
    const onClimb = climb && climb.w >= 1;
    const slope = Math.atan2(my, Math.abs(mx) || .001);
    const pitchTarget = -(onClimb ? clamp(slope * .8, -.5, .6) : clamp(slope * .35, -.28, .32)) * intro * (1 - outro);
    flight.pitch += (pitchTarget - flight.pitch) * (onClimb ? .16 : .08);
    // Posición suavizada (para que los cambios de tramo no salten)
    if (!flight.placed) { flight.x = fx; flight.y = fy; flight.placed = true; }
    const kp = reduceMotion ? 1 : .2;
    flight.x += (fx - flight.x) * kp;
    flight.y += (fy - flight.y) * kp;
    // Estela: la línea del gráfico se pinta detrás del avión
    if (climb) {
        flight.climbT = (flight.climbT ?? climb.t) + (climb.t - (flight.climbT ?? climb.t)) * kp;
        document.querySelectorAll('#climbChart .climb-done').forEach(el => el.style.strokeDashoffset = climbLen * (1 - flight.climbT));
    }

    heroSpot.style.pointerEvents = intro < .3 ? 'auto' : 'none';
    // En el hero vuela delante; al viajar pasa por detrás del contenido para no tapar la lectura
    planeLayer.style.zIndex = intro < .3 || (climb && climb.w > .3) ? '40' : '5';
    maskPath.style.strokeDashoffset = total - flight.len;
    hint.style.opacity = clamp(1 - sy / 120, 0, 1);
}

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
    const s = flight.scale * planeW / 2.5;
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

// ================= FILTROS DE PROYECTOS =================
let filtro = 'all';

function renderChips() {
    document.querySelectorAll('.destino-chips').forEach(box => {
        box.innerHTML = FILTERS.map(f => {
            const active = f.k === filtro;
            const tone = active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50';
            return `<button type="button" data-k="${f.k}" class="px-4 py-2 rounded-full text-sm font-medium transition-all border ${tone}">${f.label}</button>`;
        }).join('');
    });
}

function setFiltro(k) {
    filtro = k;
    renderChips();
    renderBoard();
}

document.addEventListener('click', e => {
    const chip = e.target.closest('.destino-chips button');
    if (chip) setFiltro(chip.dataset.k);
});

$('#boardBtn').addEventListener('click', () => {
    barrelRoll();
    setTimeout(() => {
        $('#ventanilla').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    }, reduceMotion ? 0 : 500);
});

// ================= RUTA CON ESCALAS (PROYECTOS) =================
const route = $('#route');
const routeItems = $('#routeItems');
const routeList = [...PROJECTS].sort((a, b) => a.year.localeCompare(b.year)); // 2018 → 2025
// Paleta de las estampillas: papel turquesa, marco y tinta (la misma en todas)
const STAMP = { paper: '#BFE6E8', frame: '#2FA4B5', ink: '#164E5A' };

routeItems.innerHTML = routeList.map((p, i) => {
    const live = p.num === '01';
    const st = STAMP;
    return `<div class="route-item" role="listitem" data-tags="${p.tags.join(' ')}">
        <span class="route-stop ${live ? 'live' : ''}" style="--d:${350 + i * 260}ms"></span>
        <article class="route-card stamp ${i % 2 ? 'below' : 'above'}" style="--d:${450 + i * 260}ms; --frame:${st.frame}; --ink:${st.ink}">
            <div class="stamp-inner" style="background:${st.paper}">
                <div class="flex items-start justify-between gap-3">
                    <span class="stamp-year">${p.year}</span>
                    <span class="stamp-value">WA-${p.num}</span>
                </div>
                <h3 class="stamp-title mt-4">${p.title}</h3>
                <p class="stamp-sub">${p.sub}</p>
                <p class="stamp-meta"><b>${p.role}</b> · ${p.metric}</p>
                <div class="flex flex-wrap gap-1.5 mt-3">
                    ${p.stack.map(t => `<span class="stamp-chip">${t}</span>`).join('')}
                </div>
            </div>
            ${live ? '<span class="stamp-postmark">EN<br>VUELO<br>· 2025 ·</span>' : ''}
        </article>
    </div>`;
}).join('');

// Escritorio: cada tarjeta se centra sobre su escala, alternando arriba y abajo de la ruta
function layoutRoute() {
    const items = [...routeItems.children];
    if (!matchMedia('(min-width: 1024px)').matches) return;
    // Tres estampillas arriba y tres abajo, con la misma separación; las de abajo desplazadas medio paso
    const W = route.clientWidth, GAP = 48, SEP = 28, shift = W / 6;
    const cw = Math.floor((W - shift - 2 * SEP) / 3);
    route.style.setProperty('--cw', cw + 'px');
    // Todas las estampillas con el alto de la más alta
    route.style.removeProperty('--ch');
    const maxH = Math.max(...items.map(it => it.querySelector('.route-card').offsetHeight));
    route.style.setProperty('--ch', maxH + 'px');
    const heights = items.map(() => maxH);
    const topH = maxH, botH = maxH;
    const trackY = topH + GAP;
    route.style.setProperty('--track-y', trackY + 'px');
    route.style.setProperty('--route-h', (trackY + GAP + botH) + 'px');
    items.forEach((it, i) => {
        const k = Math.floor(i / 2);
        const left = (i % 2 ? shift : 0) + k * (cw + SEP);
        const x = left + cw / 2; // la escala queda al centro de su estampilla
        it.style.setProperty('--sx', x + 'px');
        it.style.setProperty('--sy', trackY + 'px');
        it.style.setProperty('--cl', left + 'px');
        it.style.setProperty('--cx', (x - left) + 'px');
        it.style.setProperty('--ct', (i % 2 === 0 ? topH - heights[i] : trackY + GAP) + 'px');
    });
}
// Los filtros atenúan las escalas que no corresponden (la ruta se mantiene)
function renderBoard() {
    routeItems.querySelectorAll('.route-item').forEach(it => {
        const match = filtro === 'all' || it.dataset.tags.split(' ').includes(filtro);
        it.querySelector('.route-card').classList.toggle('dim', !match);
    });
}
layoutRoute();
addEventListener('resize', layoutRoute);
document.fonts && document.fonts.ready.then(layoutRoute);
// La ruta se dibuja al llegar a la sección
new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) {
        layoutRoute();
        route.classList.add('on');
        obs.disconnect();
    }
}, { threshold: .2 }).observe(route);

// ================= PASAPORTE Y MALETA 3D =================
// Su código y sus texturas se cargan recién cuando están por aparecer en pantalla
let renderPassport = () => {};
let renderLuggage = () => {};
const lazyScene = (sel, load) => new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    load();
}, { rootMargin: '300px 0px' }).observe($(sel));
lazyScene('#passport', () => import('./passport.js').then(m => { renderPassport = m.initPassport(); }));
lazyScene('#luggage', () => import('./luggage.js').then(m => { renderLuggage = m.initLuggage(); }));

// ================= PASAPORTE: sello "APROBADO" =================
new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) {
        setTimeout(() => $('#approvedStamp').classList.add('show'), 400);
        obs.disconnect();
    }
}, { threshold: .6 }).observe($('#passport'));

// ================= PERFIL DE ASCENSO (EXPERIENCIA) =================
(() => {
    const svg = $('#climbChart');
    const GROUND = 290, NOW = 2026;
    const STAGES = [
        { from: 2015, to: 2018, fl: 'FL080', y: 228, label: 'Software Developer', short: 'Developer' },
        { from: 2018, to: 2022, fl: 'FL200', y: 152, label: 'Software Engineer', short: 'Engineer' },
        { from: 2022, to: NOW, fl: 'FL350', y: 64, label: 'Tech Lead', short: 'Tech Lead' },
    ];
    // En móvil el gráfico usa un lienzo más angosto y letras más grandes para que se lea
    const compactMQ = matchMedia('(max-width: 639px)');
    function drawChart() {
    const compact = compactMQ.matches;
    const VW = compact ? 640 : 1200, X0 = compact ? 84 : 90, X1 = VW - 40, f = compact ? 1.6 : 1;
    svg.setAttribute('viewBox', `0 0 ${VW} 340`);
    const xAt = year => X0 + (year - 2015) / (NOW - 2015) * (X1 - X0);
    // Despegue y ascensos en escalón, con curvas suaves
    let d = `M ${X0} ${GROUND}`, prevY = GROUND;
    STAGES.forEach(st => {
        const xa = xAt(st.from), xb = xAt(st.from + .7);
        d += ` L ${xa} ${prevY} C ${xa + 30} ${prevY}, ${xb - 30} ${st.y}, ${xb} ${st.y} L ${xAt(st.to)} ${st.y}`;
        prevY = st.y;
    });
    const area = `${d} L ${X1} ${GROUND} L ${X0} ${GROUND} Z`;
    const mono = 'font-family="IBM Plex Mono, monospace"';
    const levels = STAGES.map(st => `
        <line x1="${X0}" y1="${st.y}" x2="${X1}" y2="${st.y}" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4 8"/>
        <text x="${X0 - 12}" y="${st.y + 5 * f}" text-anchor="end" ${mono} font-size="${13 * f}" font-weight="600" fill="#94a3b8">${st.fl}</text>`).join('');
    const ticks = [2015, 2018, 2022].map(y => `
        <line x1="${xAt(y)}" y1="${GROUND}" x2="${xAt(y)}" y2="${GROUND + 8}" stroke="#94a3b8" stroke-width="2"/>
        <text x="${xAt(y)}" y="${GROUND + 24 + 6 * f}" text-anchor="middle" ${mono} font-size="${14 * f}" font-weight="600" fill="#475569">${y}</text>`).join('')
        + `<text x="${X1}" y="${GROUND + 24 + 6 * f}" text-anchor="end" ${mono} font-size="${14 * f}" font-weight="600" fill="#047857">HOY</text>`;
    const tags = STAGES.map((st, i) => {
        const cx = (xAt(st.from + .7) + xAt(st.to)) / 2;
        return `<g class="climb-tag" style="--d:${.8 + i * .6}s">
            <text x="${cx}" y="${st.y - 16}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="${17 * (compact ? 1.4 : 1)}" font-weight="800" fill="#1e293b">${compact ? st.short : st.label}</text>
        </g>`;
    }).join('');
    svg.innerHTML = `
        <defs>
            <linearGradient id="climbFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#7CC4E8" stop-opacity=".35"/>
                <stop offset="1" stop-color="#7CC4E8" stop-opacity="0"/>
            </linearGradient>
        </defs>
        ${levels}
        <line x1="${X0 - 30}" y1="${GROUND}" x2="${X1 + 20}" y2="${GROUND}" stroke="#334155" stroke-width="3"/>
        <line x1="${X0 - 20}" y1="${GROUND + 4}" x2="${X0 + 60}" y2="${GROUND + 4}" stroke="#334155" stroke-width="2" stroke-dasharray="8 6"/>
        <text x="${X0 - 26}" y="${GROUND - 10}" ${mono} font-size="${12 * f}" font-weight="600" fill="#334155">LIM</text>
        ${ticks}
        <path class="climb-area" d="${area}" fill="url(#climbFill)"/>
        <path id="climbLine" d="${d}" fill="none" stroke="#2B6CB0" stroke-opacity=".35" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 9"/>
        <path class="climb-done" d="${d}" fill="none" stroke="#7CC4E8" stroke-opacity=".45" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="climb-done" d="${d}" fill="none" stroke="#2B6CB0" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${tags}`;

    // La estela la pinta el avión al pasar (ver climbFlight)
    climbLen = 0;
    const len = $('#climbLine').getTotalLength();
    svg.querySelectorAll('.climb-done').forEach(p => {
        p.style.strokeDasharray = `${len} ${len}`;
        p.style.strokeDashoffset = len;
    });
    }
    drawChart();
    compactMQ.addEventListener('change', drawChart);

    // Fichas de cada tramo
    $('#climbStrips').innerHTML = ESCALAS.map((e, i) => {
        const now = i === ESCALAS.length - 1;
        return `<article class="strip ${now ? 'now' : ''}" role="listitem">
            <div class="strip-head"><span>TRAMO ${String(i + 1).padStart(2, '0')} · ${STAGES[i].fl}</span><span>${e.years}</span></div>
            <div class="strip-body">
                <div class="flex items-start justify-between gap-3">
                    <h3 class="font-serif text-xl font-bold text-slate-900 leading-tight">${e.role}</h3>
                    ${now ? '<span class="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>En crucero</span>' : ''}
                </div>
                <p class="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 mt-1.5">${e.place}</p>
                <p class="text-sm text-slate-700 mt-3 leading-relaxed">${e.desc}</p>
                <ul class="mt-3 space-y-1.5 text-[13px] text-slate-700 leading-snug">
                    ${e.loot.map(l => `<li class="flex gap-2"><span class="font-mono text-sky-700">›</span><span>${l}</span></li>`).join('')}
                </ul>
                <div class="flex flex-wrap gap-1.5 mt-4">${e.stack.map(t => `<span class="strip-chip">${t}</span>`).join('')}</div>
            </div>
        </article>`;
    }).join('');

    // Relleno y etiquetas aparecen al llegar a la sección
    new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) {
            $('#climb').classList.add('on');
            obs.disconnect();
        }
    }, { threshold: .3 }).observe(svg);
})();

// ================= POSTAL =================
const form = $('#postcardForm');
const CONTACT_EMAIL = 'alamaswilmer@gmail.com';
$('#postmarkDate').textContent = new Date().toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

const pcMessage = $('#pcMessage');
const updateCount = () => { $('#pcCount').textContent = `${pcMessage.value.length} / 600`; };
pcMessage.addEventListener('input', updateCount);

form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#pcName').value.trim();
    const email = $('#pcEmail').value.trim();
    const message = $('#pcMessage').value.trim();
    const valid = name && email && message && $('#pcEmail').checkValidity();
    $('#pcError').classList.toggle('hidden', !!valid);
    if (!valid) return;

    // Envío vía FormSubmit (el mismo servicio del sitio actual)
    const sending = fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, message, _subject: 'Postal desde el portafolio', _template: 'table' }),
    }).then(r => r.ok).catch(() => false);

    $('#postmark').classList.add('show');
    setTimeout(() => $('#postcardWrap').classList.add('fly'), 700);
    const [ok] = await Promise.all([sending, new Promise(r => setTimeout(r, 1900))]);

    $('#postcardWrap').classList.add('hidden');
    $('#postcardDone').classList.remove('hidden');
    if (ok) {
        $('#pcDoneTitle').textContent = '¡Postal en camino! ✈';
        $('#pcDoneText').textContent = 'Respondo en menos de 24 h.';
    } else {
        $('#pcDoneTitle').textContent = 'La postal se quedó en tierra';
        $('#pcDoneText').innerHTML = `No se pudo enviar. Escríbeme directo a <a class="text-sky-700 underline" href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`;
    }
});

$('#pcAgain').addEventListener('click', () => {
    form.reset();
    updateCount();
    $('#postmark').classList.remove('show');
    $('#postcardDone').classList.add('hidden');
    const wrap = $('#postcardWrap');
    wrap.classList.remove('hidden');
    requestAnimationFrame(() => wrap.classList.remove('fly'));
});

// ================= TARJETA DE EMBARQUE: el talón se desprende con el scroll =================
const pass = $('.boarding-pass');
const bpMain = $('.bp-main');
const bpStub = $('.bp-stub');
const bpStamp = $('#bpStamp');
let passIsRow = true, lastTear = -1;
new ResizeObserver(() => {
    passIsRow = getComputedStyle(pass).flexDirection === 'row';
    lastTear = -1;
}).observe(pass);

function updateTear() {
    const p = reduceMotion ? 0 : clamp((scrollY - 30) / 260, 0, 1);
    if (Math.abs(p - lastTear) < .001) return;
    lastTear = p;
    const e = ease(p);
    const detach = ease(clamp((p - .55) / .45, 0, 1)); // primero se abre la perforación, luego se suelta
    if (passIsRow) {
        // El talón pivota desde abajo: se abre por arriba y luego cae
        bpStub.style.transform = `translate(${e * 6 + detach * 10}px, ${detach * 8}px) rotate(${e * 3 + detach * 2}deg)`;
        bpMain.style.transform = `rotate(${-e * .5}deg)`;
    } else {
        // En móvil cae menos para no tapar las métricas de abajo
        bpStub.style.transform = `translate(${-detach * 4}px, ${e * 5 + detach * 6}px) rotate(${-(e * 1.5 + detach * 1)}deg)`;
        bpMain.style.transform = `rotate(${e * .4}deg)`;
    }
    const s = clamp((p - .7) / .3, 0, 1);
    bpStamp.style.opacity = s * .85;
    bpStamp.style.transform = `rotate(-12deg) scale(${lerp(1.8, 1, ease(s))})`;
}

// ================= MODO OSCURO (vuelo nocturno) =================
// El tema inicial ya lo aplicó el layout antes de pintar; aquí se sincroniza lo demás y se cambia con el botón
const themeToggle = $('#themeToggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
const systemDark = matchMedia('(prefers-color-scheme: dark)');
function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    themeColor?.setAttribute('content', dark ? '#0E1626' : '#FBF9F5');
    themeToggle.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
    themeToggle.title = dark ? 'Vuelo diurno' : 'Vuelo nocturno';
    setCloudTheme(dark);
}
applyTheme(document.documentElement.classList.contains('dark'));
themeToggle.addEventListener('click', () => {
    const dark = !document.documentElement.classList.contains('dark');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
    applyTheme(dark);
});
// Si nunca eligió, sigue al sistema
systemDark.addEventListener('change', e => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) applyTheme(e.matches);
});

// ================= INICIO =================
renderChips();

const rebuild = () => { buildFlightPath(); resizeRenderer(); };
rebuild();
let rebuildTimer;
const scheduleRebuild = () => { clearTimeout(rebuildTimer); rebuildTimer = setTimeout(rebuild, 120); };
new ResizeObserver(scheduleRebuild).observe(document.body);
addEventListener('resize', scheduleRebuild);
addEventListener('load', rebuild);
document.fonts && document.fonts.ready.then(rebuild);

let last = performance.now();
(function loop(t) {
    const dt = Math.min(64, t - last);
    last = t;
    updateFlight();
    updateTear();
    renderClouds(t);
    renderPassport(t);
    renderPlane(t, dt);
    renderLuggage(t);
    requestAnimationFrame(loop);
})(performance.now());
