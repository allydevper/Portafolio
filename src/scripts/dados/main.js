// Página /dados: une la preparación, el marcador, la partida y la mesa 3D
import { DICE, getDie, randomRivalSet } from './dice-data.js';
import { dieIcon } from './icons.js';
import { Game } from './game.js';
import { aiDecide } from './ai.js';
import { initTable } from './scene.js';
import { unlockAudio, setMuted } from './sound.js';

const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));

// ---------- Preferencias (meta y dados elegidos) ----------
const KEY = 'dados-kcd2';
const settings = { target: 4000, dice: Array(6).fill('ordinary'), muted: false };
try {
    Object.assign(settings, JSON.parse(localStorage.getItem(KEY) || '{}'));
} catch (err) { /* sin almacenamiento: valores por defecto */ }
settings.dice = settings.dice.map(id => getDie(id).id);
const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (err) { /* nada */ }
};

// ---------- Mesa ----------
let game = null;
let waiting = null; // resolve de la acción del jugador mientras es su turno
const table = initTable($('#board'), { onPick });
if (!table) $('#noGl').hidden = false;
// Se puede tocar cualquier dado de la última tirada
table?.setPickable(slot => !!waiting && game.rolled.some(r => r.slot === slot));

// ---------- Utilidades de interfaz ----------
let toastTimer = 0;
function toast(text, kind = '') {
    const el = $('#toast');
    el.textContent = text;
    el.className = `toast show ${kind}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'toast'; }, 1800);
}

// ---------- Preparación ----------
let activeSlot = 0;
function renderLoadout() {
    const box = $('#loadout');
    box.replaceChildren(...settings.dice.map((id, i) => {
        const die = getDie(id);
        const b = document.createElement('button');
        b.className = 'slot' + (i === activeSlot ? ' active' : '');
        b.append(dieIcon(die), Object.assign(document.createElement('span'), { textContent: die.name.replace(/ die$/, '') }));
        b.onclick = () => {
            if (i === activeSlot) settings.dice[i] = 'ordinary';
            activeSlot = i;
            save();
            renderLoadout();
        };
        return b;
    }));
}

function renderGrid() {
    const q = $('#diceSearch').value.trim().toLowerCase();
    $('#diceGrid').replaceChildren(...DICE.filter(d => d.name.toLowerCase().includes(q)).map(die => {
        const card = document.createElement('button');
        card.className = 'die-card';
        const name = Object.assign(document.createElement('strong'), { textContent: die.name });
        const used = settings.dice.filter(id => id === die.id).length;
        if (used) card.dataset.used = String(used);
        card.append(dieIcon(die), name);
        card.onclick = () => {
            settings.dice[activeSlot] = die.id;
            activeSlot = (activeSlot + 1) % 6;
            save();
            renderLoadout();
            renderGrid();
        };
        return card;
    }));
}

function renderTargets() {
    document.querySelectorAll('#targets .chip').forEach(c => {
        c.classList.toggle('active', Number(c.dataset.target) === settings.target);
    });
}

$('#targets').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    settings.target = Number(chip.dataset.target);
    save();
    renderTargets();
});
$('#diceSearch').addEventListener('input', renderGrid);
$('#btnResetDice').onclick = () => {
    settings.dice = Array(6).fill('ordinary');
    activeSlot = 0;
    save();
    renderLoadout();
    renderGrid();
};
$('#btnStart').onclick = () => {
    unlockAudio();
    $('#setup').hidden = true;
    play();
};
$('#btnAgain').onclick = () => {
    $('#end').hidden = true;
    $('#setup').hidden = false;
};

// ---------- Marcador y botones ----------
function renderHud() {
    $('#goal').textContent = String(game.target);
    game.players.forEach((p, i) => {
        const plate = $(`#plate${i}`);
        plate.classList.toggle('active', game.current === i);
        plate.querySelector('[data-total]').textContent = String(p.total);
        plate.querySelector('[data-bar]').style.width = `${Math.min(100, p.total / game.target * 100)}%`;
        plate.querySelector('[data-dice]').replaceChildren(...p.dice.map(dieIcon));
    });
    renderTurn();
}

function renderTurn() {
    const sel = game.selection;
    const mine = !!waiting;
    $('#turnPts').textContent = String(game.turnPts + (sel ? sel.points : 0));
    const info = $('#selInfo');
    // Lo guardado en tiradas anteriores de este turno (también antes de unos dados calientes), para que el total se entienda
    const saved = game.turnPts ? `${game.turnPts} guardados` : '';
    if (!game.selected.size) info.textContent = saved || (mine ? 'Elige los dados que puntúan' : game.player.ai ? 'Turno del rival' : 'Tirando…');
    else if (!sel) info.textContent = `${saved ? saved + ' · ' : ''}Selección = 0: hay dados que no forman combinación`;
    else {
        // Los comodines (cabeza de diablo, Balatro) cuentan como el valor que más conviene, no como la cara que muestran
        const jokers = game.rolled.filter(r => r.joker && game.selected.has(r.slot)).length;
        const note = jokers ? ` · ${jokers === 1 ? 'con comodín' : `con ${jokers} comodines`}` : '';
        info.textContent = `${saved ? saved + ' + ' : ''}${sel.parts.map(p => p.label).join(' + ')} = ${sel.points}${note}`;
    }
    info.classList.toggle('bad', game.selected.size > 0 && !sel);
    $('#btnRoll').disabled = !mine || !sel;
    $('#btnBank').disabled = !mine || !sel;
    $('#btnGiveUp').disabled = game.winner !== null;
    // Si apartaría los seis, la próxima tirada es con todos
    const all = sel && game.locked.length + game.selected.size === 6;
    $('#btnRoll').textContent = all ? 'Tirar los seis' : 'Tirar de nuevo';
}

function onPick(slot) {
    if (!waiting) return;
    game.toggle(slot);
    table.setSelected(game.selected);
    renderTurn();
}

const act = action => () => {
    if (!waiting) return;
    const resolve = waiting;
    waiting = null;
    resolve(action);
};
$('#btnRoll').onclick = act('roll');
$('#btnBank').onclick = act('bank');
// Rendirse se puede en cualquier momento de la partida, con confirmación propia (confirm() no siempre se muestra)
$('#btnGiveUp').onclick = () => {
    if (game && game.winner === null) $('#giveUp').hidden = false;
};
$('#giveUp [data-close]').onclick = () => { $('#giveUp').hidden = true; };
$('#btnGiveUpYes').onclick = () => {
    $('#giveUp').hidden = true;
    if (!game || game.winner !== null) return;
    game.giveUp(0);
    // Corta tiradas y animaciones en curso; si era tu turno, suelta la espera de tu jugada
    table.reset();
    act('giveup')();
};
$('#btnHelp').onclick = () => { $('#help').hidden = false; };
$('#help [data-close]').onclick = () => { $('#help').hidden = true; };
const renderMute = () => {
    $('#btnMute').classList.toggle('off', settings.muted);
    setMuted(settings.muted);
};
$('#btnMute').onclick = () => {
    settings.muted = !settings.muted;
    save();
    renderMute();
};
addEventListener('keydown', e => {
    if (!waiting || e.target instanceof HTMLInputElement) return;
    if (e.key === ' ' && !$('#btnRoll').disabled) { e.preventDefault(); act('roll')(); }
    if (e.key === 'Enter' && !$('#btnBank').disabled) { e.preventDefault(); act('bank')(); }
});

// ---------- Partida ----------
async function play() {
    if (!table) return;
    await table.ready;
    const g = game = new Game({
        target: settings.target,
        players: [
            { name: 'Tú', dice: settings.dice },
            { name: 'Rival', dice: randomRivalSet(), ai: true },
        ],
    });
    // Empieza quien quiera la suerte
    if (Math.random() < .5) g.nextTurn();
    while (g.winner === null) {
        await playTurn(g);
        if (g.winner === null) g.nextTurn();
    }
    renderHud();
    const won = g.winner === 0;
    $('#endTitle').textContent = g.gaveUp ? 'Te rendiste' : won ? '¡Victoria!' : 'Derrota';
    $('#endText').textContent = g.gaveUp
        ? 'El rival se queda con la apuesta.'
        : `${g.players[0].total} a ${g.players[1].total}. ${won ? 'El rival paga la ronda.' : 'Otra vez será.'}`;
    await wait(g.gaveUp ? 200 : 600);
    $('#end').hidden = false;
}

// Cada espera revisa si la partida terminó (por ejemplo, al rendirse) para no seguir jugando
async function playTurn(g) {
    const over = () => g.winner !== null;
    const from = g.current === 0 ? 1 : -1;
    const ai = !!g.player.ai;
    table.reset();
    table.setDice(g.player.dice);
    renderHud();
    toast(ai ? 'Turno del rival' : 'Tu turno');
    await wait(ai ? 700 : 400);

    while (!over()) {
        const rolled = g.roll();
        renderTurn();
        await table.throwDice(rolled.map(r => r.slot), rolled.map(r => r.face), from);
        if (over()) return;

        if (g.bust) {
            const lost = g.turnPts;
            g.loseTurn();
            renderTurn();
            // Sin combinaciones: se pierde lo del turno y juega el otro
            toast(`Sin combinaciones${lost ? `: se pierden ${lost}` : ''}. ${ai ? 'Te toca' : 'Turno del rival'}`, 'bad');
            await wait(1700);
            return;
        }

        const action = ai ? await aiStep(g) : await new Promise(r => { waiting = r; renderTurn(); });
        if (over() || action === 'giveup') return;
        if (action === 'bank') {
            const r = g.bank();
            table.setSelected(new Set());
            await table.lock(r.slots, from);
            renderHud();
            toast(`${ai ? 'El rival se planta' : 'Te plantas'} con ${r.gained}`, 'good');
            await wait(1300);
            return;
        }
        const r = g.keep();
        table.setSelected(new Set());
        await table.lock(r.slots, from);
        renderTurn();
        if (r.hot) {
            table.clearLocks();
            toast('¡Dados calientes! Otra vez los seis', 'good');
            await wait(900);
        }
    }
}

// El rival marca sus dados de a uno para que se vea qué aparta
async function aiStep(g) {
    await wait(650);
    if (g.winner !== null) return null;
    const d = aiDecide(g);
    for (const slot of d.slots) {
        if (g.winner !== null) return null;
        g.toggle(slot);
        table.setSelected(g.selected);
        renderTurn();
        await wait(260);
    }
    await wait(d.bank ? 700 : 500);
    return d.bank ? 'bank' : 'roll';
}

renderTargets();
renderLoadout();
renderGrid();
renderMute();
