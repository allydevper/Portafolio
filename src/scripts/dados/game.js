// Estado y reglas de una partida (sin DOM ni 3D): main.js decide el ritmo y la escena lo dibuja
import { getDie, rollDie } from './dice-data.js';
import { scoreSelection, canScore } from './scoring.js';

// Valor con el que puntúa un dado tirado: el comodín es 0
export const valueOf = r => r.joker ? 0 : r.face;

export class Game {
    constructor({ target, players }) {
        this.target = target;
        // players: [{ name, dice: [id × 6], ai }]
        this.players = players.map(p => ({ ...p, dice: p.dice.map(getDie), total: 0 }));
        this.current = 0;
        this.winner = null;
        this.gaveUp = false;
        this.startTurn();
    }

    get player() { return this.players[this.current]; }
    get rival() { return this.players[1 - this.current]; }

    startTurn() {
        this.turnPts = 0;    // puntos guardados en tiradas anteriores de este turno
        this.locked = [];    // dados apartados (no se vuelven a tirar hasta los dados calientes)
        this.rolled = [];    // { slot, face, joker } de la última tirada
        this.selected = new Set();
    }

    // Tira los dados libres según los pesos de cada uno
    roll(rand = Math.random) {
        const free = [0, 1, 2, 3, 4, 5].filter(s => !this.locked.includes(s));
        this.rolled = free.map(slot => ({ slot, ...rollDie(this.player.dice[slot], rand) }));
        this.selected.clear();
        return this.rolled;
    }

    get bust() { return !canScore(this.rolled.map(valueOf)); }

    // Puntaje de los dados marcados ({ points, parts }) o null si alguno no aporta
    get selection() {
        return scoreSelection(this.rolled.filter(r => this.selected.has(r.slot)).map(valueOf));
    }

    // Marcar o desmarcar un dado de la última tirada, como en el juego: se puede marcar cualquiera,
    // pero si alguno no puntúa la selección vale 0 y no deja tirar ni plantarse
    toggle(slot) {
        if (!this.rolled.some(r => r.slot === slot)) return;
        this.selected.has(slot) ? this.selected.delete(slot) : this.selected.add(slot);
    }

    // Aparta los dados marcados y suma su puntaje al turno. hot: todos puntuaron, se vuelven a tirar los 6
    keep() {
        const sel = this.selection;
        if (!sel) return null;
        const slots = [...this.selected];
        this.turnPts += sel.points;
        this.locked.push(...slots);
        this.rolled = this.rolled.filter(r => !this.selected.has(r.slot));
        this.selected.clear();
        const hot = this.locked.length === 6;
        if (hot) this.locked = [];
        return { points: sel.points, slots, hot };
    }

    // Se planta: guarda la selección y suma el turno al total
    bank() {
        const kept = this.keep();
        if (!kept) return null;
        const gained = this.turnPts;
        this.player.total += gained;
        if (this.player.total >= this.target) this.winner = this.current;
        return { ...kept, gained };
    }

    loseTurn() { this.turnPts = 0; }

    // Se rinde el jugador who (0 = tú) y gana el otro
    giveUp(who) {
        this.gaveUp = true;
        this.winner = 1 - who;
    }

    nextTurn() {
        this.current = 1 - this.current;
        this.startTurn();
    }
}
