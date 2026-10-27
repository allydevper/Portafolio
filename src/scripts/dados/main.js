// Página /dados: une la preparación, el marcador, la partida y la mesa 3D
import { DICE, getDie, randomRivalSet } from './dice-data.js';
import { cubeIcon } from './faces.js';
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
        b.append(cubeIcon(die), Object.assign(document.createElement('span'), { textContent: die.name.replace(/ die$/, '') }));
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
        card.append(cubeIcon(die), name);
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
        plate.querySelector('[data-dice]').replaceChildren(...p.dice.map(cubeIcon));
    });
    renderTurn();
}

function renderTurn() {
    const sel = game.selection;
    const mine = !!waiting;
    $('#turnPts').textContent = String(game.turnPts + (sel ? sel.points : 0));
    const info = $('#selInfo');
    if (!game.selected.size) info.textContent = mine ? 'Elige los dados que puntúan' : game.player.ai ? 'Turno del rival' : 'Tirando…';
    else if (!sel) info.textContent = 'Hay dados marcados que no puntúan';
    else info.textContent = `${sel.parts.map(p => p.label).join(' + ')} = ${sel.points}`;
    info.classList.toggle('bad', game.selected.size > 0 && !sel);
    $('#btnRoll').disabled = !mine || !sel;
    $('#btnBank').disabled = !mine || !sel;
    $('#btnGiveUp').disabled = !mine;
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
$('#btnGiveUp').onclick = () => {
    if (waiting && confirm('¿Rendirte? El rival gana la partida.')) act('giveup')();
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
    game = new Game({
        target: settings.target,
        players: [
            { name: 'Tú', dice: settings.dice },
            { name: 'Rival', dice: randomRivalSet(), ai: true },
        ],
    });
    // Empieza quien quiera la suerte
    if (Math.random() < .5) game.nextTurn();
    while (game.winner === null) {
        await playTurn();
        if (game.winner === null) game.nextTurn();
    }
    renderHud();
    const won = game.winner === 0;
    $('#endTitle').textContent = won ? '¡Victoria!' : 'Derrota';
    $('#endText').textContent = `${game.players[0].total} a ${game.players[1].total}. ${won ? 'El rival paga la ronda.' : 'Otra vez será.'}`;
    await wait(600);
    $('#end').hidden = false;
}

async function playTurn() {
    const from = game.current === 0 ? 1 : -1;
    const ai = !!game.player.ai;
    table.reset();
    table.setDice(game.player.dice);
    renderHud();
    toast(ai ? 'Turno del rival' : 'Tu turno');
    await wait(ai ? 700 : 400);

    for (;;) {
        const rolled = game.roll();
        renderTurn();
        await table.throwDice(rolled.map(r => r.slot), rolled.map(r => r.face), from);

        if (game.bust) {
            const lost = game.turnPts;
            game.loseTurn();
            renderTurn();
            toast(lost ? `¡Nada! Se pierden ${lost}` : '¡Nada puntúa!', 'bad');
            await wait(1700);
            return;
        }

        const action = ai ? await aiStep() : await new Promise(r => { waiting = r; renderTurn(); });
        if (action === 'giveup') {
            game.giveUp();
            return;
        }
        if (action === 'bank') {
            const r = game.bank();
            table.setSelected(new Set());
            await table.lock(r.slots, from);
            renderHud();
            toast(`${ai ? 'El rival se planta' : 'Te plantas'} con ${r.gained}`, 'good');
            await wait(1300);
            return;
        }
        const r = game.keep();
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
async function aiStep() {
    await wait(650);
    const d = aiDecide(game);
    for (const slot of d.slots) {
        game.toggle(slot);
        table.setSelected(game.selected);
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
