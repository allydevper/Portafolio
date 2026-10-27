// Sonidos sintetizados (ruido filtrado y tonos cortos), sin archivos de audio
let ctx = null, noise = null, muted = false;

// El audio solo puede arrancar tras un gesto del usuario
export function unlockAudio() {
    if (ctx) return;
    try {
        ctx = new AudioContext();
    } catch (err) {
        return;
    }
    noise = ctx.createBuffer(1, ctx.sampleRate * .25, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
}

export const setMuted = m => { muted = m; };

// Ráfaga de ruido con envolvente rápida pasada por un filtro
function burst({ at = 0, dur, type, freq, q = 1, gain, rate = 1 }) {
    const now = ctx.currentTime + at;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = rate;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(.001, now + dur);
    src.connect(f).connect(g).connect(ctx.destination);
    src.start(now, Math.random() * .1, dur + .02);
}

// Dado contra la mesa o contra otro dado
let lastAt = 0;
export function clack(v) {
    if (!ctx || muted) return;
    // Muchos choques juntos suenan como uno solo
    if (ctx.currentTime - lastAt < .025) return;
    lastAt = ctx.currentTime;
    burst({ dur: .05, type: 'bandpass', freq: 1800 + Math.random() * 1600, q: 4, gain: Math.min(.9, v / 14), rate: .8 + Math.random() * .5 });
}

// Dados dentro del cubilete de madera: golpes apagados, más graves que sobre la mesa
export function rattle(v = 1) {
    if (!ctx || muted) return;
    const n = 2 + (Math.random() * 3 | 0);
    for (let i = 0; i < n; i++) {
        burst({ at: i * (.012 + Math.random() * .02), dur: .045, type: 'bandpass', freq: 700 + Math.random() * 700, q: 3, gain: (.18 + Math.random() * .2) * v, rate: .7 + Math.random() * .3 });
    }
    // La madera del cubilete resuena un poco
    burst({ dur: .07, type: 'lowpass', freq: 380, q: 1, gain: .14 * v });
}

// Dado que rueda por la madera: roce corto
export function roll(v = 1) {
    if (!ctx || muted) return;
    burst({ dur: .03, type: 'bandpass', freq: 1200 + Math.random() * 800, q: 2.5, gain: .1 * v, rate: .9 + Math.random() * .3 });
}
