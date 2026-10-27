// Puntuación del juego de dados de KCD2 (funciones puras, sin DOM)
// Cada dado es un valor 1..6; el comodín (cabeza de diablo, Balatro) se pasa como 0.
// El comodín no puntúa solo ni como 1 o 5 sueltos: únicamente completa tríos (o más) y escaleras,
// y toda combinación lleva al menos un dado de verdad
export const TRIPLE = [0, 1000, 200, 300, 400, 500, 600];
export const STRAIGHTS = [
    { faces: [1, 2, 3, 4, 5, 6], points: 1500, label: '1-2-3-4-5-6' },
    { faces: [2, 3, 4, 5, 6], points: 750, label: '2-3-4-5-6' },
    { faces: [1, 2, 3, 4, 5], points: 500, label: '1-2-3-4-5' },
];
// Cada dado extra sobre el trío duplica: 4 = ×2, 5 = ×4, 6 = ×8
export const kindPoints = (face, n) => TRIPLE[face] * 2 ** (n - 3);

// Mejor forma de puntuar TODOS los dados: real[1..6] cuenta los dados normales y jokers los comodines.
// null si alguno no aporta
const memo = new Map();
function bestOf(real, jokers) {
    const key = real.join() + '|' + jokers;
    if (memo.has(key)) return memo.get(key);
    let best = jokers === 0 && real.every(c => c === 0) ? { points: 0, parts: [] } : null;
    if (!best) {
        const tryOpt = (points, label, take, usedJokers) => {
            const rest = real.slice();
            take(rest);
            const sub = bestOf(rest, jokers - usedJokers);
            if (sub && (!best || sub.points + points > best.points)) best = { points: sub.points + points, parts: [{ label, points }, ...sub.parts] };
        };
        // Escaleras: cada cara la pone un dado de verdad o un comodín (también se puede usar el comodín aunque haya dado,
        // para dejar ese dado libre para otra combinación)
        for (const s of STRAIGHTS) {
            const n = s.faces.length;
            for (let mask = 0; mask < 1 << n; mask++) {
                const wild = s.faces.filter((_, i) => mask & 1 << i);
                if (wild.length > jokers || wild.length === n) continue;
                if (s.faces.some((f, i) => !(mask & 1 << i) && real[f] === 0)) continue;
                tryOpt(s.points, s.label, r => s.faces.forEach((f, i) => { if (!(mask & 1 << i)) r[f]--; }), wild.length);
            }
        }
        // Tres o más iguales, con al menos un dado de verdad
        for (let f = 1; f <= 6; f++) {
            for (let n = 3; n <= real[f] + jokers; n++) {
                for (let a = Math.max(1, n - jokers); a <= Math.min(real[f], n); a++) {
                    tryOpt(kindPoints(f, n), `${n}× ${f}`, r => { r[f] -= a; }, n - a);
                }
            }
        }
        // Sueltos: solo dados de verdad
        if (real[1]) tryOpt(100, '1', r => { r[1]--; }, 0);
        if (real[5]) tryOpt(50, '5', r => { r[5]--; }, 0);
    }
    memo.set(key, best);
    return best;
}

const split = values => {
    const real = [0, 0, 0, 0, 0, 0, 0];
    let jokers = 0;
    for (const v of values) v === 0 ? jokers++ : real[v]++;
    return [real, jokers];
};

// Puntos de una selección (todos sus dados deben aportar) o null si no es válida
export function scoreSelection(values) {
    if (!values.length) return null;
    return bestOf(...split(values));
}

// ¿Hay alguna combinación en la tirada? Si no, es bust y pasa el turno
export function canScore(values) {
    const [real, jokers] = split(values);
    if (real[1] || real[5]) return true;
    for (let f = 1; f <= 6; f++) if (real[f] && real[f] + jokers >= 3) return true;
    return STRAIGHTS.some(s => {
        const missing = s.faces.filter(f => !real[f]).length;
        return missing <= jokers && missing < s.faces.length;
    });
}

// Todas las selecciones válidas de una tirada: índices dentro de values y su puntaje
export function scoringOptions(values) {
    const out = [];
    for (let mask = 1; mask < 1 << values.length; mask++) {
        const idx = values.map((_, i) => i).filter(i => mask & 1 << i);
        const r = scoreSelection(idx.map(i => values[i]));
        if (r) out.push({ idx, points: r.points });
    }
    return out;
}
