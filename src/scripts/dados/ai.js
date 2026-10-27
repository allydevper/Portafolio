// Rival automático: qué dados apartar y cuándo plantarse
import { scoringOptions } from './scoring.js';
import { valueOf } from './game.js';

// Puntos de turno a partir de los cuales se planta, según cuántos dados le quedarían por tirar
const BANK_AT = [0, 250, 300, 400, 650, 2000, Infinity];

export function aiDecide(game) {
    const values = game.rolled.map(valueOf);
    const options = scoringOptions(values).map(o => ({ ...o, slots: o.idx.map(i => game.rolled[i].slot) }));
    if (!options.length) return null;

    const left = o => {
        const n = values.length - o.idx.length;
        return n === 0 ? 6 : n;
    };
    const max = options.reduce((a, b) => b.points > a.points || (b.points === a.points && left(b) > left(a)) ? b : a);
    const { total } = game.player, { target } = game, rivalTotal = game.rival.total;

    // Con lo máximo ya gana: se planta
    if (total + game.turnPts + max.points >= target) return { slots: max.slots, bank: true };

    // Para seguir tirando conviene apartar poco y quedarse con más dados (cada dado que queda vale ~60 pts)
    const keep = options.reduce((a, b) => {
        const va = a.points + 60 * left(a), vb = b.points + 60 * left(b);
        return vb > va ? b : a;
    });
    const turn = game.turnPts + keep.points;
    // Si el rival está por ganar, arriesga más
    const urgency = rivalTotal >= target - 400 ? 2 : rivalTotal - total > 1500 ? 1.4 : 1;
    if (turn >= BANK_AT[left(keep)] * urgency) {
        // Plantarse con todo lo que puntúa de esta tirada
        return { slots: max.slots, bank: true };
    }
    return { slots: keep.slots, bank: false };
}
