// Aspecto de los dados, copiado de los iconos de la wiki (Dice/KCD2): material, color y tipo de punto.
// Varios dados comparten icono en el juego, así que comparten aspecto
import { seeded } from '../vuelo/util.js';

// pips: 'hole' agujero taladrado · 'engrave' grabado tono sobre tono · 'ring' anillo con punto (hueso) · 'small' punto chico
// tint: segundo color en manchas · patina: manchas de cardenillo · wood: vetas · emblem: dibujo en lugar del 1
export const LOOKS = {
    wood: { base: '#4a2c1c', tint: '#2a170c', pip: '#140904', pips: 'hole', wood: true, rough: .7 },
    oak: { base: '#7a5232', tint: '#4e3220', pip: '#1e1108', pips: 'hole', wood: true, rough: .7 },
    steel: { base: '#4f6f96', tint: '#38557a', pip: '#c3d1e2', pips: 'hole', rough: .55 },
    gold: { base: '#e0b142', tint: '#b8841c', pip: '#94650f', pips: 'engrave', rough: .32, metal: .55 },
    devil: { base: '#e0b142', tint: '#b8841c', pip: '#94650f', pips: 'engrave', rough: .32, metal: .55, emblem: 'devil' },
    paleGold: { base: '#ecd690', tint: '#cdae55', pip: '#a8883a', pips: 'engrave', rough: .4, metal: .25 },
    silver: { base: '#d9dbdc', tint: '#a9adb2', pip: '#7c8188', pips: 'hole', rough: .45, metal: .15 },
    terracotta: { base: '#b45d3c', tint: '#86391f', pip: '#331309', pips: 'hole', rough: .75 },
    moss: { base: '#3f5a2a', tint: '#26391a', pip: '#e0c93c', pips: 'hole', rough: .7 },
    clay: { base: '#c98a68', tint: '#9e6146', pip: '#46271a', pips: 'hole', rough: .75 },
    rose: { base: '#b98a74', tint: '#8c5e4a', pip: '#3c2216', pips: 'hole', rough: .75 },
    heaven: { base: '#e3e9f0', tint: '#a6b7cc', pip: '#121212', pips: 'hole', rough: .3, emblem: 'crest', radius: .3 },
    skull: { base: '#b6b4ae', tint: '#83817b', pip: '#2a2a28', pips: 'ring', rough: .8, emblem: 'skull' },
    weathered: { base: '#8a99ab', tint: '#e2e3dc', pip: '#3c4858', pips: 'hole', rough: .8 },
    periwinkle: { base: '#aab9e2', tint: '#8597c9', pip: '#53639a', pips: 'hole', rough: .5 },
    cornflower: { base: '#8fa2d8', tint: '#6a7ebe', pip: '#425189', pips: 'hole', rough: .5 },
    molar: { base: '#bbb8b0', tint: '#8e8b83', pip: '#2a2926', pips: 'ring', rough: .8 },
    premolar: { base: '#d0c7a6', tint: '#a2987a', pip: '#3a3424', pips: 'ring', rough: .8 },
    wisdom: { base: '#6f6d66', tint: '#47453f', pip: '#121210', pips: 'ring', rough: .85 },
    copper: { base: '#a8533e', tint: '#7a3424', pip: '#341409', pips: 'hole', rough: .55, metal: .35, patina: '#4fa39a' },
    pearl: { base: '#ecc9e8', tint: '#c3a5ea', pip: '#1a1220', pips: 'hole', rough: .22, iridescence: 1, radius: .28 },
    sage: { base: '#a3ab9f', tint: '#788174', pip: '#2b302a', pips: 'hole', rough: .75 },
    stone: { base: '#c9ccc9', tint: '#9a9e9b', pip: '#373a38', pips: 'hole', rough: .8 },
    peach: { base: '#b1aca3', tint: '#e1aa76', pip: '#262019', pips: 'small', rough: .7 },
    apricot: { base: '#a8a399', tint: '#dc9a62', pip: '#221c16', pips: 'small', rough: .7 },
    jester: { base: '#5f8fd6', tint: '#4473bf', pip: '#131826', pips: 'hole', big: true, rough: .45, emblem: 'jester' },
};

// Posiciones en un lienzo de 256
const PIPS = {
    1: [[128, 128]],
    2: [[70, 70], [186, 186]],
    3: [[70, 70], [128, 128], [186, 186]],
    4: [[70, 70], [186, 70], [70, 186], [186, 186]],
    5: [[70, 70], [186, 70], [128, 128], [70, 186], [186, 186]],
    6: [[70, 64], [186, 64], [70, 128], [186, 128], [70, 192], [186, 192]],
};

const hash = s => [...s].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619), 2166136261);

// Pinta una cara: mode 'color' (lo que se ve) o 'bump' (relieve: oscuro = hundido)
export function paintFace(lookId, value, size = 256, mode = 'color') {
    const look = LOOKS[lookId];
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    g.scale(size / 256, size / 256);
    const rand = seeded(hash(lookId) + value * 7919);
    const bump = mode === 'bump';

    if (bump) {
        g.fillStyle = '#808080';
        g.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 900; i++) {
            const v = 128 + (rand() - .5) * 60 | 0;
            g.fillStyle = `rgb(${v},${v},${v})`;
            g.fillRect(rand() * 256, rand() * 256, 1 + rand() * 3, 1 + rand() * 3);
        }
        if (look.wood) grain(g, rand, 'rgba(60,60,60,.35)');
    } else {
        g.fillStyle = look.base;
        g.fillRect(0, 0, 256, 256);
        // Manchas del segundo color: el material no es parejo
        for (let i = 0; i < 26; i++) blob(g, rand() * 256, rand() * 256, 20 + rand() * 70, look.tint, .12 + rand() * .22);
        if (look.wood) grain(g, rand, look.tint);
        if (look.patina) for (let i = 0; i < 14; i++) {
            // El cardenillo se junta en los bordes
            const side = rand() * 4 | 0, t = rand() * 256, inset = rand() * 26;
            const [x, y] = [[t, inset], [256 - inset, t], [t, 256 - inset], [inset, t]][side];
            blob(g, x, y, 14 + rand() * 30, look.patina, .35 + rand() * .3);
        }
        // Suciedad y rayones
        for (let i = 0; i < 700; i++) {
            g.fillStyle = rand() < .6 ? `rgba(20,12,6,${.04 + rand() * .1})` : `rgba(255,250,240,${.04 + rand() * .08})`;
            g.fillRect(rand() * 256, rand() * 256, 1 + rand() * 2.5, 1 + rand() * 2.5);
        }
        g.lineCap = 'round';
        for (let i = 0; i < 7; i++) {
            const x = rand() * 256, y = rand() * 256, a = rand() * 6.3, l = 10 + rand() * 40;
            g.strokeStyle = `rgba(255,250,235,${.08 + rand() * .12})`;
            g.lineWidth = .8 + rand();
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
            g.stroke();
        }
        // Cantos gastados (más claros) y mugre en la orilla
        for (const [x0, y0, x1, y1] of [[0, 0, 0, 30], [0, 256, 0, 226], [0, 0, 30, 0], [256, 0, 226, 0]]) {
            const eg = g.createLinearGradient(x0, y0, x1, y1);
            eg.addColorStop(0, 'rgba(255,248,232,.22)');
            eg.addColorStop(1, 'rgba(255,248,232,0)');
            g.fillStyle = eg;
            g.fillRect(0, 0, 256, 256);
        }
        g.strokeStyle = 'rgba(25,15,8,.35)';
        g.lineWidth = 3;
        g.strokeRect(1.5, 1.5, 253, 253);
    }

    if (value === 1 && look.emblem) EMBLEMS[look.emblem](g, look, bump);
    else for (const [x, y] of PIPS[value]) pip(g, x, y, look, bump, value === 1);
    return c;
}

function blob(g, x, y, r, color, alpha) {
    const bg = g.createRadialGradient(x, y, 0, x, y, r);
    bg.addColorStop(0, color);
    bg.addColorStop(1, 'transparent');
    g.globalAlpha = alpha;
    g.fillStyle = bg;
    g.fillRect(x - r, y - r, r * 2, r * 2);
    g.globalAlpha = 1;
}

function grain(g, rand, color) {
    g.strokeStyle = color;
    for (let i = 0; i < 70; i++) {
        const y0 = rand() * 256, amp = 1 + rand() * 4, f = .01 + rand() * .03, ph = rand() * 6;
        g.globalAlpha = .15 + rand() * .35;
        g.lineWidth = .6 + rand() * 1.8;
        g.beginPath();
        for (let x = 0; x <= 256; x += 6) g.lineTo(x, y0 + Math.sin(x * f + ph) * amp);
        g.stroke();
    }
    g.globalAlpha = 1;
}

function pip(g, x, y, look, bump, single) {
    const style = look.pips;
    let r = style === 'small' ? 9 : look.big ? 29 : 21;
    if (single && style !== 'small') r *= 1.15;
    if (style === 'ring') {
        // Anillo y punto, tallado en hueso
        g.strokeStyle = bump ? '#202020' : look.pip;
        g.fillStyle = g.strokeStyle;
        g.lineWidth = 5;
        g.beginPath();
        g.arc(x, y, r, 0, 7);
        g.stroke();
        g.beginPath();
        g.arc(x, y, r * .3, 0, 7);
        g.fill();
        return;
    }
    if (bump) {
        const hg = g.createRadialGradient(x, y, 0, x, y, r + 2);
        hg.addColorStop(0, style === 'engrave' ? '#505050' : '#151515');
        hg.addColorStop(.75, style === 'engrave' ? '#606060' : '#303030');
        hg.addColorStop(1, '#808080');
        g.fillStyle = hg;
        g.beginPath();
        g.arc(x, y, r + 2, 0, 7);
        g.fill();
        return;
    }
    if (style === 'engrave') {
        // Grabado: hundido tono sobre tono con borde marcado
        g.fillStyle = look.pip;
        g.globalAlpha = .45;
        g.beginPath();
        g.arc(x, y, r, 0, 7);
        g.fill();
        g.globalAlpha = 1;
        g.strokeStyle = look.pip;
        g.lineWidth = 3;
        g.stroke();
        g.strokeStyle = 'rgba(255,245,210,.45)';
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(x + 1, y + 2, r + 1.5, .2, 2.9);
        g.stroke();
        return;
    }
    // Agujero: canto claro abajo, sombra arriba a la izquierda
    g.fillStyle = 'rgba(255,250,235,.22)';
    g.beginPath();
    g.arc(x + 1.2, y + 1.8, r + 1, 0, 7);
    g.fill();
    const hg = g.createRadialGradient(x - r * .35, y - r * .35, 1, x, y, r);
    hg.addColorStop(0, shade(look.pip, -.45));
    hg.addColorStop(1, look.pip);
    g.fillStyle = hg;
    g.beginPath();
    g.arc(x, y, r, 0, 7);
    g.fill();
}

// Aclara (+) u oscurece (-) un color #rrggbb
function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const ch = s => {
        const v = n >> s & 255;
        return Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
    };
    return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

const EMBLEMS = {
    // Cabeza de diablo grabada en el oro (Devil's head die)
    devil(g, look, bump) {
        g.save();
        g.translate(128, 132);
        g.strokeStyle = bump ? '#303030' : look.pip;
        g.lineWidth = 6;
        g.lineJoin = g.lineCap = 'round';
        const path = d => { g.beginPath(); d(); g.stroke(); };
        // Cuernos
        for (const s of [-1, 1]) path(() => {
            g.moveTo(s * 30, -46);
            g.quadraticCurveTo(s * 72, -70, s * 62, -104);
            g.quadraticCurveTo(s * 50, -72, s * 16, -58);
        });
        // Cara y barba en punta
        path(() => {
            g.moveTo(-50, -46);
            g.quadraticCurveTo(-58, 10, -30, 40);
            g.lineTo(0, 92);
            g.lineTo(30, 40);
            g.quadraticCurveTo(58, 10, 50, -46);
            g.quadraticCurveTo(0, -70, -50, -46);
        });
        // Cejas, ojos, nariz y boca
        for (const s of [-1, 1]) {
            path(() => { g.moveTo(s * 8, -22); g.lineTo(s * 40, -34); });
            path(() => { g.moveTo(s * 12, -10); g.quadraticCurveTo(s * 26, -18, s * 36, -8); g.quadraticCurveTo(s * 24, -2, s * 12, -10); });
        }
        path(() => { g.moveTo(0, -4); g.lineTo(-8, 18); g.lineTo(8, 18); });
        path(() => { g.moveTo(-26, 34); g.quadraticCurveTo(0, 50, 26, 34); });
        g.restore();
    },
    // Escudo con corona y cruz en negro (Heavenly Kingdom die)
    crest(g, look, bump) {
        g.save();
        g.translate(128, 134);
        g.fillStyle = g.strokeStyle = bump ? '#303030' : look.pip;
        g.lineWidth = 7;
        g.lineJoin = 'round';
        g.beginPath();
        g.moveTo(-46, -40);
        g.lineTo(46, -40);
        g.lineTo(46, 4);
        g.quadraticCurveTo(46, 46, 0, 70);
        g.quadraticCurveTo(-46, 46, -46, 4);
        g.closePath();
        g.stroke();
        g.fillRect(-5, -32, 10, 92);
        g.fillRect(-38, -4, 76, 10);
        // Corona
        g.beginPath();
        g.moveTo(-40, -50);
        g.lineTo(-40, -82);
        g.lineTo(-20, -64);
        g.lineTo(0, -92);
        g.lineTo(20, -64);
        g.lineTo(40, -82);
        g.lineTo(40, -50);
        g.closePath();
        g.fill();
        g.restore();
    },
    // Calavera grabada (Hugo's die)
    skull(g, look, bump) {
        g.save();
        g.translate(128, 124);
        const ink = bump ? '#202020' : look.pip;
        g.strokeStyle = g.fillStyle = ink;
        g.lineWidth = 6;
        g.lineCap = 'round';
        g.beginPath();
        g.arc(0, -14, 56, Math.PI * .8, Math.PI * 2.2);
        g.lineTo(34, 44);
        g.lineTo(-34, 44);
        g.closePath();
        g.stroke();
        for (const s of [-1, 1]) {
            g.beginPath();
            g.ellipse(s * 22, -8, 15, 18, 0, 0, 7);
            g.fill();
        }
        g.beginPath();
        g.moveTo(0, 14);
        g.lineTo(-8, 28);
        g.lineTo(8, 28);
        g.closePath();
        g.fill();
        for (let x = -24; x <= 24; x += 12) {
            g.beginPath();
            g.moveTo(x, 44);
            g.lineTo(x, 70);
            g.stroke();
        }
        g.beginPath();
        g.moveTo(-30, 70);
        g.lineTo(30, 70);
        g.stroke();
        g.restore();
    },
    // Bufón pintado (Balatro's die)
    jester(g, _look, bump) {
        g.save();
        g.translate(128, 136);
        if (bump) {
            g.fillStyle = '#9a9a9a';
            g.beginPath();
            g.arc(0, 0, 70, 0, 7);
            g.fill();
            g.restore();
            return;
        }
        // Gorro de dos puntas con cascabeles
        for (const [s, col] of [[-1, '#d83a3a'], [1, '#f2c230']]) {
            g.fillStyle = col;
            g.beginPath();
            g.moveTo(0, -36);
            g.quadraticCurveTo(s * 40, -96, s * 86, -70);
            g.quadraticCurveTo(s * 52, -50, s * 44, -16);
            g.closePath();
            g.fill();
            g.fillStyle = '#f2c230';
            g.beginPath();
            g.arc(s * 88, -70, 11, 0, 7);
            g.fill();
        }
        // Cara blanca, nariz roja y sonrisa
        g.fillStyle = '#f6efe4';
        g.beginPath();
        g.ellipse(0, 4, 44, 50, 0, 0, 7);
        g.fill();
        g.fillStyle = '#1a1a2a';
        for (const s of [-1, 1]) {
            g.beginPath();
            g.ellipse(s * 16, -8, 5, 8, 0, 0, 7);
            g.fill();
        }
        g.fillStyle = '#d83a3a';
        g.beginPath();
        g.arc(0, 10, 8, 0, 7);
        g.fill();
        g.strokeStyle = '#1a1a2a';
        g.lineWidth = 5;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(-24, 26);
        g.quadraticCurveTo(0, 48, 24, 26);
        g.stroke();
        // Gola
        g.fillStyle = '#d83a3a';
        for (let i = -2; i <= 2; i++) {
            g.beginPath();
            g.moveTo(i * 18 - 9, 52);
            g.lineTo(i * 18 + 9, 52);
            g.lineTo(i * 18, 74);
            g.closePath();
            g.fill();
        }
        g.restore();
    },
};

// Miniatura isométrica en CSS (tres caras): para el selector y el marcador
const urls = new Map();
const faceUrl = (lookId, v) => {
    const key = `${lookId}:${v}`;
    if (!urls.has(key)) urls.set(key, paintFace(lookId, v, 96).toDataURL());
    return urls.get(key);
};
export function cubeIcon(die) {
    const wrap = document.createElement('span');
    wrap.className = 'cube';
    wrap.title = die.name;
    const look = LOOKS[die.look];
    if (look.radius) wrap.classList.add('round');
    const body = document.createElement('b');
    for (const [cls, v] of [['t', 1], ['f', 2], ['r', 3]]) {
        const f = document.createElement('i');
        f.className = cls;
        f.style.backgroundImage = `url(${faceUrl(die.look, v)})`;
        body.append(f);
    }
    wrap.append(body);
    return wrap;
}
