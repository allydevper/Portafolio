// Puntuación del juego de dados de KCD2 (funciones puras, sin DOM)
// Cada dado es un valor 1..6; el comodín se pasa como 0 y toma el valor que más convenga
export const TRIPLE = [0, 1000, 200, 300, 400, 500, 600];
export const STRAIGHTS = [
    { faces: [1, 2, 3, 4, 5, 6], points: 1500, label: '1-2-3-4-5-6' },
    { faces: [2, 3, 4, 5, 6], points: 750, label: '2-3-4-5-6' },
    { faces: [1, 2, 3, 4, 5], points: 500, label: '1-2-3-4-5' },
];
// Cada dado extra sobre el trío duplica: 4 = ×2, 5 = ×4, 6 = ×8
export const kindPoints = (face, n) => TRIPLE[face] * 2 ** (n - 3);

// Mejor forma de puntuar TODOS los dados de counts (índices 1..6); null si alguno no aporta
const memo = new Map();
function bestOf(counts) {
    const key = counts.join();
    if (memo.has(key)) return memo.get(key);
    let best = counts.every(c => c === 0) ? { points: 0, parts: [] } : null;
    if (!best) {
        const tryOpt = (points, label, take) => {
            const rest = counts.slice();
            take(rest);
            const sub = bestOf(rest);
            if (sub && (!best || sub.points + points > best.points)) best = { points: sub.points + points, parts: [{ label, points }, ...sub.parts] };
        };
        for (const s of STRAIGHTS) if (s.faces.every(f => counts[f] > 0)) tryOpt(s.points, s.label, r => s.faces.forEach(f => r[f]--));
        for (let f = 1; f <= 6; f++) for (let n = 3; n <= counts[f]; n++) tryOpt(kindPoints(f, n), `${n}× ${f}`, r => { r[f] -= n; });
        if (counts[1]) tryOpt(100, '1', r => { r[1]--; });
        if (counts[5]) tryOpt(50, '5', r => { r[5]--; });
    }
    memo.set(key, best);
    return best;
}

// Puntos de una selección (todos sus dados deben aportar) o null si no es válida
export function scoreSelection(values) {
    if (!values.length) return null;
    const counts = [0, 0, 0, 0, 0, 0, 0];
    let jokers = 0;
    for (const v of values) v === 0 ? jokers++ : counts[v]++;
    let best = null;
    // Los comodines se reparten como multiconjunto (valores no decrecientes): a lo sumo 462 casos con 6
    const assign = (k, from) => {
        if (k === 0) {
            const r = bestOf(counts);
            if (r && (!best || r.points > best.points)) best = r;
            return;
        }
        for (let f = from; f <= 6; f++) { counts[f]++; assign(k - 1, f); counts[f]--; }
    };
    assign(jokers, 1);
    return best;
}

// ¿Hay algún dado que puntúe? Si no, es bust (las escaleras siempre llevan un 1 o un 5)
export function canScore(values) {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const v of values) {
        if (v === 0 || v === 1 || v === 5) return true;
        if (++counts[v] >= 3) return true;
    }
    return false;
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
