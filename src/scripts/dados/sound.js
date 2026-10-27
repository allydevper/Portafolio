// Golpes de dado sintetizados (ruido filtrado), sin archivos de audio
let ctx = null, noise = null, muted = false;

// El audio solo puede arrancar tras un gesto del usuario
export function unlockAudio() {
    if (ctx) return;
    try {
        ctx = new AudioContext();
    } catch (err) {
        return;
    }
    noise = ctx.createBuffer(1, ctx.sampleRate * .06, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 4);
}

export const setMuted = m => { muted = m; };

let lastAt = 0;
export function clack(v) {
    if (!ctx || muted) return;
    const now = ctx.currentTime;
    // Muchos choques juntos suenan como uno solo
    if (now - lastAt < .025) return;
    lastAt = now;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = .8 + Math.random() * .5;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1800 + Math.random() * 1600;
    bp.Q.value = 4;
    const gain = ctx.createGain();
    gain.gain.value = Math.min(.9, v / 14);
    src.connect(bp).connect(gain).connect(ctx.destination);
    src.start(now);
}
