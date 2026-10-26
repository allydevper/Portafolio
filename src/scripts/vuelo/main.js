// Home "Vuelo WA-2015": ruta del avión, escenas 3D y animaciones de cada escala
import { $, clamp, lerp, ease, reduceMotion } from './util.js';

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

let samples = [], total = 1, startPt = null, endPt = null, pathKey = '';
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
    // Si nada se movió (pasa seguido al cargar fuentes o imágenes), no hay que recalcular
    const key = `${W},${H},` + pts.map(p => `${p.x.toFixed(1)}:${p.y.toFixed(1)}`).join(',');
    if (key === pathKey) return;
    pathKey = key;

    // Curvas en S: los puntos de control mantienen la Y siempre creciente
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], dy = b.y - a.y;
        d += ` C ${a.x} ${a.y + dy * .5}, ${b.x} ${b.y - dy * .5}, ${b.x} ${b.y}`;
    }
    routePaths.forEach(p => p.setAttribute('d', d));

    // Muestras a igual distancia sobre la curva, calculadas con la fórmula de cada tramo
    // (medir el SVG punto por punto tomaba ~160 ms)
    const dense = [{ x: pts[0].x, y: pts[0].y, l: 0 }];
    for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], dy = b.y - a.y;
        const c1y = a.y + dy * .5, c2y = b.y - dy * .5;
        const steps = Math.max(8, Math.ceil((Math.abs(dy) + Math.abs(b.x - a.x)) / 4));
        for (let k = 1; k <= steps; k++) {
            const t = k / steps, u = 1 - t;
            const x = (u * u * u + 3 * u * u * t) * a.x + (3 * u * t * t + t * t * t) * b.x;
            const y = u * u * u * a.y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * b.y;
            const prev = dense[dense.length - 1];
            dense.push({ x, y, l: prev.l + Math.hypot(x - prev.x, y - prev.y) });
        }
    }
    total = dense[dense.length - 1].l;
    const N = Math.max(300, Math.round(total / 6));
    samples = [];
    for (let i = 0, j = 1; i <= N; i++) {
        const l = total * i / N;
        while (j < dense.length - 1 && dense[j].l < l) j++;
        const p = dense[j - 1], q = dense[j], f = (l - p.l) / ((q.l - p.l) || 1);
        samples.push({ l, x: lerp(p.x, q.x, f), y: lerp(p.y, q.y, f) });
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

// ================= AVIÓN Y NUBES 3D =================
// Viven en scene.js y se cargan después del primer pintado (ver INICIO); hasta entonces no hacen nada
let renderPlane = () => {};
let renderClouds = () => {};
let resizeRenderer = () => {};
let setCloudTheme = () => {};
let barrelRoll = () => {};

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
addEventListener('load', scheduleRebuild);
document.fonts && document.fonts.ready.then(scheduleRebuild);

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

// La escena 3D entra después del primer pintado y aparece con un fundido cuando sus shaders están listos
requestAnimationFrame(() => setTimeout(() => {
    import('./scene.js').then(m => {
        const s3d = m.initScene({ flight, heroSpot, getPlaneW: () => planeW, rebuild });
        ({ resizeRenderer, setCloudTheme, barrelRoll } = s3d);
        resizeRenderer();
        setCloudTheme(document.documentElement.classList.contains('dark'));
        return s3d.ready.then(() => {
            ({ renderPlane, renderClouds } = s3d);
            requestAnimationFrame(() => document.documentElement.classList.add('scene-ready'));
        });
    }).catch(() => $('#planeFallback').classList.remove('hidden'));
}));
