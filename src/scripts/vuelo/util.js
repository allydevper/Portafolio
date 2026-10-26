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
