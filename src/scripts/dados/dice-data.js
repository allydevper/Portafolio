// Los 43 dados de Kingdom Come: Deliverance II con la probabilidad (%) de cada cara, del 1 al 6 (wiki Dice/KCD2)
// look: aspecto según el icono de la wiki (faces.js)
// joker: la cara del 1 es una figura (cabeza de diablo, bufón) que hace de comodín
const D = (id, name, weights, look, extra = {}) => ({ id, name, weights, look, ...extra });
const FAIR = [16.7, 16.7, 16.7, 16.7, 16.7, 16.7];

export const DICE = [
    D('ordinary', 'Ordinary die', FAIR, 'wood'),
    D('aranka', "Aranka's die", [28.6, 4.8, 28.6, 4.8, 28.6, 4.8], 'peach'),
    D('balatro', "Balatro's die", FAIR, 'jester', { joker: true }),
    D('cautious', "Cautious cheater's die", [23.8, 14.3, 9.5, 14.3, 23.8, 14.3], 'peach'),
    D('ci', 'Ci die', [13, 13, 13, 13, 13, 34.8], 'steel'),
    D('devil', "Devil's head die", FAIR, 'devil', { joker: true }),
    D('misfortune', 'Die of misfortune', [4.5, 22.7, 22.7, 22.7, 22.7, 4.5], 'apricot'),
    D('even', 'Even die', [6.7, 26.7, 6.7, 26.7, 6.7, 26.7], 'paleGold'),
    D('favourable', 'Favourable die', [33.3, 0, 5.6, 5.6, 33.3, 22.2], 'silver'),
    D('fer', 'Fer die', [13, 13, 13, 13, 13, 34.8], 'steel'),
    D('greasy', 'Greasy die', [17.6, 11.8, 17.6, 11.7, 17.6, 23.5], 'terracotta'),
    D('grimy', 'Grimy die', [6.2, 31.2, 6.2, 6.2, 43.7, 6.2], 'moss'),
    D('grozav', "Grozav's lucky die", [6.7, 66.7, 6.7, 6.7, 6.7, 6.7], 'clay'),
    D('heavenly', 'Heavenly Kingdom die', [36.8, 10.5, 10.5, 10.5, 10.5, 21], 'heaven'),
    D('holytrinity', 'Holy Trinity die', [18.2, 22.7, 45.4, 4.5, 4.5, 4.5], 'wood'),
    D('hugo', "Hugo's die", FAIR, 'skull'),
    D('king', "King's die", [12.5, 18.7, 21.9, 25, 12.5, 9.4], 'gold'),
    D('lousy', "Lousy gambler's die", [10, 15, 10, 15, 35, 15], 'weathered'),
    D('lu', 'Lu die', [13, 13, 13, 13, 13, 34.8], 'steel'),
    D('lucky', 'Lucky die', [27.3, 4.5, 9.1, 13.6, 18.2, 27.3], 'periwinkle'),
    D('mathematician', "Mathematician's die", [16.7, 20.8, 25, 29.2, 4.2, 4.2], 'silver'),
    D('molar', 'Molar die', FAIR, 'molar'),
    D('monk', "Monk's die", [40, 40, 5, 5, 5, 5], 'copper'),
    D('pearl', 'Mother-of-pearl die', [25, 8.3, 8.3, 8.3, 25, 25], 'pearl'),
    D('odd', 'Odd die', [26.7, 6.7, 26.7, 6.7, 26.7, 6.7], 'rose'),
    D('painted', 'Painted die', [18.7, 6.2, 6.2, 6.2, 43.7, 18.7], 'steel'),
    D('painterB', "Painter's die B", [9.1, 27.2, 18.2, 18.2, 18.2, 9.1], 'steel'),
    D('painterG', "Painter's die G", [9.1, 27.2, 18.2, 18.2, 18.2, 9.1], 'moss'),
    D('painterR', "Painter's die R", [9.1, 27.2, 18.2, 18.2, 18.2, 9.1], 'terracotta'),
    D('pie', 'Pie die', [46.2, 7.7, 23.1, 23.1, 0, 0], 'rose'),
    D('premolar', 'Premolar die', FAIR, 'premolar'),
    D('sadgreaser', "Sad Greaser's die", [26.1, 26.1, 4.3, 4.3, 26.1, 13], 'steel'),
    D('antiochus', "Saint Antiochus' die", [20, 6.7, 40, 6.7, 6.7, 20], 'gold'),
    D('shrinking', 'Shrinking die', [22.2, 11.1, 11.1, 11.1, 11.1, 33.3], 'cornflower'),
    D('stephen', "St. Stephen's die", FAIR, 'rose'),
    D('strip', 'Strip die', [25, 12.5, 12.5, 12.5, 18.8, 18.8], 'periwinkle'),
    D('tengri', "Tengri's die", [28.5, 14.3, 14.3, 14.3, 14.3, 14.3], 'molar'),
    D('trinity', 'Trinity die', [12.5, 6.2, 56.2, 6.2, 12.5, 6.2], 'oak'),
    D('unbalanced', 'Unbalanced die', [25, 33.3, 8.3, 8.3, 16.7, 8.3], 'sage'),
    D('unlucky', 'Unlucky die', [9.1, 27.3, 18.2, 18.2, 18.2, 9.1], 'moss'),
    D('wagoner', "Wagoner's die", [5.6, 27.8, 33.3, 11.1, 11.1, 11.1], 'stone'),
    D('weighted', 'Weighted die', [66.7, 6.7, 6.7, 6.7, 6.7, 6.7], 'apricot'),
    D('wisdom', 'Wisdom tooth die', FAIR, 'wisdom'),
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
    const joker = !!die.joker && face === 1;
    return { face, joker };
}


// Set del rival: entre 1 y 4 dados especiales al azar, el resto normales
export function randomRivalSet(rand = Math.random) {
    const pool = DICE.filter(d => d.id !== 'ordinary' && d.id !== 'balatro');
    const n = 1 + Math.floor(rand() * 4);
    const set = Array(6).fill('ordinary');
    for (let i = 0; i < n; i++) set[i] = pool[Math.floor(rand() * pool.length)].id;
    return set;
}
