// Los 43 dados de Kingdom Come: Deliverance II con la probabilidad (%) de cada cara, del 1 al 6 (wiki Dice/KCD2)
// joker: 'one' = la cara del 1 es la cabeza del diablo (comodín); 'all' = cualquier cara cuenta como comodín
const D = (id, name, weights, body, pip, extra = {}) => ({ id, name, weights, body, pip, ...extra });
const FAIR = [16.7, 16.7, 16.7, 16.7, 16.7, 16.7];

export const DICE = [
    D('ordinary', 'Ordinary die', FAIR, '#efe6d2', '#2a1d14'),
    D('aranka', "Aranka's die", [28.6, 4.8, 28.6, 4.8, 28.6, 4.8], '#c9a46a', '#3a2614'),
    D('balatro', "Balatro's die", FAIR, '#ece6f2', '#c42a3a', { joker: 'all' }),
    D('cautious', "Cautious cheater's die", [23.8, 14.3, 9.5, 14.3, 23.8, 14.3], '#d8cfc0', '#3b2a20'),
    D('ci', 'Ci die', [13, 13, 13, 13, 13, 34.8], '#5a1414', '#e8c26a'),
    D('devil', "Devil's head die", FAIR, '#1d1715', '#d23a2a', { joker: 'one' }),
    D('misfortune', 'Die of misfortune', [4.5, 22.7, 22.7, 22.7, 22.7, 4.5], '#7d7a74', '#1e1c1a'),
    D('even', 'Even die', [6.7, 26.7, 6.7, 26.7, 6.7, 26.7], '#d9d2b0', '#2b2416'),
    D('favourable', 'Favourable die', [33.3, 0, 5.6, 5.6, 33.3, 22.2], '#3f6b3a', '#f1e9d2'),
    D('fer', 'Fer die', [13, 13, 13, 13, 13, 34.8], '#6a1a12', '#e8c26a'),
    D('greasy', 'Greasy die', [17.6, 11.8, 17.6, 11.7, 17.6, 23.5], '#b48a4a', '#2c1c0c'),
    D('grimy', 'Grimy die', [6.2, 31.2, 6.2, 6.2, 43.7, 6.2], '#6d5a3e', '#e7dcc0'),
    D('grozav', "Grozav's lucky die", [6.7, 66.7, 6.7, 6.7, 6.7, 6.7], '#9c3d2b', '#f3e6cc'),
    D('heavenly', 'Heavenly Kingdom die', [36.8, 10.5, 10.5, 10.5, 10.5, 21], '#f4ead0', '#b8862b'),
    D('holytrinity', 'Holy Trinity die', [18.2, 22.7, 45.4, 4.5, 4.5, 4.5], '#e9dcb5', '#7a1f1f'),
    D('hugo', "Hugo's die", FAIR, '#ddd3bd', '#141210'),
    D('king', "King's die", [12.5, 18.7, 21.9, 25, 12.5, 9.4], '#d4a73a', '#3a2210'),
    D('lousy', "Lousy gambler's die", [10, 15, 10, 15, 35, 15], '#a99c84', '#231c14'),
    D('lu', 'Lu die', [13, 13, 13, 13, 13, 34.8], '#4a1010', '#e8c26a'),
    D('lucky', 'Lucky die', [27.3, 4.5, 9.1, 13.6, 18.2, 27.3], '#2f6e4f', '#f3ead0'),
    D('mathematician', "Mathematician's die", [16.7, 20.8, 25, 29.2, 4.2, 4.2], '#4a5a78', '#f0e8d6'),
    D('molar', 'Molar die', FAIR, '#efe9da', '#6b5a45'),
    D('monk', "Monk's die", [40, 40, 5, 5, 5, 5], '#5b4632', '#e7dcc0'),
    D('pearl', 'Mother-of-pearl die', [25, 8.3, 8.3, 8.3, 25, 25], '#f1d4d8', '#6b3a4a'),
    D('odd', 'Odd die', [26.7, 6.7, 26.7, 6.7, 26.7, 6.7], '#b0c4a0', '#1f2a18'),
    D('painted', 'Painted die', [18.7, 6.2, 6.2, 6.2, 43.7, 18.7], '#3a62a8', '#f6f1e4'),
    D('painterB', "Painter's die B", [9.1, 27.2, 18.2, 18.2, 18.2, 9.1], '#2f5fa0', '#f6f1e4'),
    D('painterG', "Painter's die G", [9.1, 27.2, 18.2, 18.2, 18.2, 9.1], '#3f8a4a', '#f6f1e4'),
    D('painterR', "Painter's die R", [9.1, 27.2, 18.2, 18.2, 18.2, 9.1], '#a83232', '#f6f1e4'),
    D('pie', 'Pie die', [46.2, 7.7, 23.1, 23.1, 0, 0], '#c98b4b', '#2c1a0a'),
    D('premolar', 'Premolar die', FAIR, '#e9e2d0', '#6b5a45'),
    D('sadgreaser', "Sad Greaser's die", [26.1, 26.1, 4.3, 4.3, 26.1, 13], '#4f6f9c', '#f2ecdc'),
    D('antiochus', "Saint Antiochus' die", [20, 6.7, 40, 6.7, 6.7, 20], '#cdb8e0', '#2a1d3a'),
    D('shrinking', 'Shrinking die', [22.2, 11.1, 11.1, 11.1, 11.1, 33.3], '#e6dccb', '#3a2a1e'),
    D('stephen', "St. Stephen's die", FAIR, '#f2e2a8', '#7a2a1a'),
    D('strip', 'Strip die', [25, 12.5, 12.5, 12.5, 18.8, 18.8], '#d98f9a', '#3a1a20'),
    D('tengri', "Tengri's die", [28.5, 14.3, 14.3, 14.3, 14.3, 14.3], '#3c7fa0', '#f1d48a'),
    D('trinity', 'Trinity die', [12.5, 6.2, 56.2, 6.2, 12.5, 6.2], '#e2cf93', '#3a2410'),
    D('unbalanced', 'Unbalanced die', [25, 33.3, 8.3, 8.3, 16.7, 8.3], '#bfae86', '#2a2014'),
    D('unlucky', 'Unlucky die', [9.1, 27.3, 18.2, 18.2, 18.2, 9.1], '#55504a', '#efe6d2'),
    D('wagoner', "Wagoner's die", [5.6, 27.8, 33.3, 11.1, 11.1, 11.1], '#8a5a2b', '#f1e4c8'),
    D('weighted', 'Weighted die', [66.7, 6.7, 6.7, 6.7, 6.7, 6.7], '#7c6d5a', '#f1e9d6'),
    D('wisdom', 'Wisdom tooth die', FAIR, '#f3eee2', '#6b5a45'),
];

export const DICE_BY_ID = Object.fromEntries(DICE.map(d => [d.id, d]));
export const ORDINARY = DICE_BY_ID.ordinary;
export const getDie = id => DICE_BY_ID[id] || ORDINARY;

// Tira un dado según sus pesos: face es la cara que queda arriba; joker si cuenta como comodín
export function rollDie(die, rand = Math.random) {
    const total = die.weights.reduce((a, b) => a + b, 0);
    let r = rand() * total, face = 6;
    for (let i = 0; i < 6; i++) {
        r -= die.weights[i];
        if (r < 0) { face = i + 1; break; }
    }
    const joker = die.joker === 'all' || (die.joker === 'one' && face === 1);
    return { face, joker };
}

// Resumen corto para el selector: las caras que más salen
export function describeDie(die) {
    if (die.joker === 'one') return 'El 1 es una cabeza de diablo: comodín';
    if (die.joker === 'all') return 'Cualquier cara cuenta como comodín';
    const max = Math.max(...die.weights), min = Math.min(...die.weights);
    if (max - min < 1) return 'Equilibrado';
    const fav = die.weights.map((w, i) => [w, i + 1]).filter(([w]) => w >= max - 2).map(([, f]) => f);
    return `Favorece ${fav.join(' y ')} (${Math.round(max)}%)`;
}

// Set del rival: entre 1 y 4 dados especiales al azar, el resto normales
export function randomRivalSet(rand = Math.random) {
    const pool = DICE.filter(d => d.id !== 'ordinary' && d.id !== 'balatro');
    const n = 1 + Math.floor(rand() * 4);
    const set = Array(6).fill('ordinary');
    for (let i = 0; i < n; i++) set[i] = pool[Math.floor(rand() * pool.length)].id;
    return set;
}
