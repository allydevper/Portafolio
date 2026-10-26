// Utilidades compartidas por el home "Vuelo WA-2015"
export const $ = s => document.querySelector(s);
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
// Espera a que los shaders compilen en paralelo, con un límite: en algunos navegadores esa espera
// no termina hasta que se dibuja algo, así que pasado el tiempo se dibuja igual
export const shadersReady = (renderer, scene, camera, ms = 1500) => Promise.race([
    Promise.resolve().then(() => renderer.compileAsync(scene, camera)).catch(() => {}),
    new Promise(r => setTimeout(r, ms)),
]);
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// En pantallas táctiles (celulares) se dibuja a menor resolución: la diferencia no se nota y la GPU respira
export const isTouch = matchMedia('(pointer: coarse)').matches;
export const maxDpr = (desktop = 2) => Math.min(devicePixelRatio, isTouch ? Math.min(desktop, 1.5) : desktop);

// Suavizado que avanza igual a 30 o a 120 fps: k es la fracción por frame a 60 fps
export const follow = (k, dt) => 1 - Math.pow(1 - k, Math.min(dt, 100) / 16.67);

// Tareas en los ratos libres del navegador
export const idle = cb => window.requestIdleCallback ? requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 60);

// Sube a la GPU las texturas de una escena de a una, en ratos libres, para que el primer frame no se trabe
export function uploadTextures(renderer, scene) {
    const texs = new Set();
    scene.traverse(o => [].concat(o.material || []).forEach(m => {
        for (const k of ['map', 'bumpMap', 'roughnessMap', 'metalnessMap', 'normalMap', 'alphaMap']) if (m[k]) texs.add(m[k]);
    }));
    const queue = [...texs];
    const step = () => {
        const tex = queue.shift();
        if (!tex) return;
        renderer.initTexture(tex);
        idle(step);
    };
    idle(step);
}

// Ruido de grano (para cuero o plástico): se pinta un azulejo chico y se repite, en vez de miles de trazos en el lienzo grande
// Los puntos que tocan un borde se repiten del otro lado, así el azulejo no deja costuras
export function grainTile(rand, size, count, dot) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    g.fillStyle = '#808080';
    g.fillRect(0, 0, size, size);
    const M = 6;
    for (let i = 0; i < count; i++) {
        const x = rand() * size, y = rand() * size, r1 = rand(), r2 = rand(), r3 = rand(), r4 = rand();
        for (const ox of x < M ? [0, size] : x > size - M ? [0, -size] : [0]) {
            for (const oy of y < M ? [0, size] : y > size - M ? [0, -size] : [0]) dot(g, x + ox, y + oy, r1, r2, r3, r4);
        }
    }
    return c;
}
// Lienzo grande cubierto con el azulejo
export function tiled(tile, w, h, blur = 0) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    if (blur) g.filter = `blur(${blur}px)`;
    g.fillStyle = g.createPattern(tile, 'repeat');
    g.fillRect(0, 0, w, h);
    return c;
}

// Aleatorio con semilla: cada nube tiene siempre la misma forma
export const seeded = seed => () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let r = Math.imul(seed ^ seed >>> 15, 1 | seed);
    r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r;
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
};

// Mascota de marca (pixel art). Se carga como blob para poder dibujarla en WebGL.
let mascotPromise = null;
export function loadMascot() {
    mascotPromise ??= fetch('/images/wilmer-mascot.svg')
        .then(r => r.text())
        .then(svg => new Promise((resolve, reject) => {
            // El SVG no trae tamaño propio: se lo damos para que todos los navegadores lo dibujen
            const sized = svg.replace(/width="100%"/, 'width="749" height="749"');
            const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }));
            const img = new Image();
            img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
            img.onerror = reject;
            img.src = url;
        }));
    return mascotPromise;
}
