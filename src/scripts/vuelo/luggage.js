import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { $, clamp, lerp, reduceMotion, seeded } from './util.js';

export function initLuggage() {
    // ================= MALETA 3D =================
    // Maleta de cabina, mismo estilo que el pasaporte: carcasa de policarbonato con relieve
    // y el stack en stickers de vinilo (frente) + etiquetas de viaje (atrás)
    let renderLuggage = () => {};
    (() => {
        const box = $('#luggage3d');
        const cv = $('#luggageCanvas');
        let lr = null;
        try {
            lr = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
        } catch (err) {
            lr = null;
        }
        if (!lr) {
            box.remove();
            $('#luggageList').classList.remove('sr-only');
            return;
        }

        const scene = new THREE.Scene();
        const cam = new THREE.PerspectiveCamera(26, 1, .1, 50);
        scene.add(new THREE.AmbientLight(0xffffff, .9));
        const keyL = new THREE.DirectionalLight(0xffffff, 1.7);
        keyL.position.set(-1.5, 2.5, 3);
        scene.add(keyL);
        const rimL = new THREE.DirectionalLight(0xdbeafe, .7);
        rimL.position.set(2.5, 1.5, -2);
        scene.add(rimL);
        const pmremL = new THREE.PMREMGenerator(lr);
        scene.environment = pmremL.fromScene(new RoomEnvironment(lr), .04).texture;

        const stdL = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .5, metalness: 0, envMapIntensity: .55, ...extra });
        const outlineL = new THREE.ShaderMaterial({
            uniforms: { color: { value: new THREE.Color(0x24395c) }, thickness: { value: .009 } },
            vertexShader: 'uniform float thickness; void main(){ vec3 p = position + normal * thickness; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
            fragmentShader: 'uniform vec3 color; void main(){ gl_FragColor = vec4(color, 1.0); }',
            side: THREE.BackSide,
        });
        const withOutlineL = mesh => {
            let og = mesh.geometry.clone();
            og.deleteAttribute('normal');
            if (og.attributes.uv) og.deleteAttribute('uv');
            og.clearGroups();
            og = mergeVertices(og);
            og.computeVertexNormals();
            mesh.add(new THREE.Mesh(og, outlineL));
            return mesh;
        };
        const MONO_L = '"IBM Plex Mono", monospace', HAND_L = '"Caveat", cursive', SERIF_L = '"Playfair Display", serif';

        // ---------- Lienzos: color, relieve y rugosidad de cada cara ----------
        const BW = 1.4, BH = 2.0, BD = .72;
        const FW = 1024, FH = 1463;
        const makeFace = srgb => {
            const c = document.createElement('canvas');
            c.width = FW;
            c.height = FH;
            const tex = new THREE.CanvasTexture(c);
            tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
            tex.anisotropy = lr.capabilities.getMaxAnisotropy();
            return { g: c.getContext('2d'), tex };
        };
        const faces = {
            front: { color: makeFace(true), bump: makeFace(false), rough: makeFace(false) },
            back: { color: makeFace(true), bump: makeFace(false), rough: makeFace(false) },
        };

        // Grano fino de la carcasa (se genera una vez)
        const grain = (() => {
            const c = document.createElement('canvas');
            c.width = FW;
            c.height = FH;
            const g = c.getContext('2d');
            g.fillStyle = '#808080';
            g.fillRect(0, 0, FW, FH);
            const rand = seeded(311);
            for (let i = 0; i < 40000; i++) {
                const v = 128 + (rand() - .5) * 46 | 0;
                g.fillStyle = `rgb(${v},${v},${v})`;
                g.fillRect(rand() * FW, rand() * FH, 1 + rand() * 2, 1 + rand() * 2);
            }
            return c;
        })();
        const scuffs = (() => {
            const rand = seeded(57);
            return [...Array(22)].map(() => {
                const x = rand() * FW, y = rand() * FH, len = 20 + rand() * 70, a = (rand() - .5) * .9;
                return [x, y, x + Math.cos(a) * len, y + Math.sin(a) * len, .5 + rand()];
            });
        })();

        const RIBS = [150, 300, 724, 874];
        // Carcasa: base, nervaduras con volumen, grano y raspones
        function shell(g, mode) {
            if (mode === 'color') {
                const bg = g.createLinearGradient(0, 0, 0, FH);
                bg.addColorStop(0, '#E8795C');
                bg.addColorStop(1, '#CD5B43');
                g.fillStyle = bg;
                g.fillRect(0, 0, FW, FH);
                // Nervaduras: luz a un lado, sombra al otro
                for (const x of RIBS) {
                    const rg = g.createLinearGradient(x - 26, 0, x + 26, 0);
                    rg.addColorStop(0, 'rgba(255,255,255,0)');
                    rg.addColorStop(.35, 'rgba(255,255,255,.22)');
                    rg.addColorStop(.5, 'rgba(255,255,255,.05)');
                    rg.addColorStop(.7, 'rgba(110,35,20,.28)');
                    rg.addColorStop(1, 'rgba(110,35,20,0)');
                    g.fillStyle = rg;
                    g.fillRect(x - 26, 30, 52, FH - 60);
                }
                g.globalCompositeOperation = 'overlay';
                g.globalAlpha = .18;
                g.drawImage(grain, 0, 0);
                g.globalCompositeOperation = 'source-over';
                g.globalAlpha = 1;
                g.strokeStyle = 'rgba(255,240,230,.18)';
                g.lineCap = 'round';
                for (const [x1, y1, x2, y2, w] of scuffs) { g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
            } else if (mode === 'bump') {
                g.drawImage(grain, 0, 0);
                for (const x of RIBS) {
                    const rg = g.createLinearGradient(x - 24, 0, x + 24, 0);
                    rg.addColorStop(0, 'rgba(255,255,255,0)');
                    rg.addColorStop(.5, 'rgba(255,255,255,.75)');
                    rg.addColorStop(1, 'rgba(255,255,255,0)');
                    g.fillStyle = rg;
                    g.fillRect(x - 24, 30, 48, FH - 60);
                }
            } else {
                g.fillStyle = '#5a5a5a'; // policarbonato semibrillante
                g.fillRect(0, 0, FW, FH);
                g.strokeStyle = '#9a9a9a';
                g.lineCap = 'round';
                for (const [x1, y1, x2, y2, w] of scuffs) { g.lineWidth = w + 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
            }
        }

        // Sticker de vinilo: troquel blanco, color, arte, brillo. En relieve/rugosidad solo cuenta la forma
        function sticker(g, mode, x, y, rot, path, fill, art, opts = {}) {
            g.save();
            g.translate(x, y);
            g.rotate(rot);
            g.lineJoin = 'round';
            if (mode !== 'color') {
                g.fillStyle = g.strokeStyle = mode === 'bump' ? '#a8a8a8' : '#3a3a3a';
                g.lineWidth = 26;
                path(); g.stroke(); g.fill();
                g.restore();
                return;
            }
            g.shadowColor = 'rgba(60,20,10,.3)';
            g.shadowBlur = 12;
            g.shadowOffsetY = 6;
            g.fillStyle = '#FFFFFF';
            g.strokeStyle = '#FFFFFF';
            g.lineWidth = 26;
            path(); g.stroke(); g.fill();
            g.shadowColor = 'transparent';
            g.fillStyle = fill;
            path(); g.fill();
            g.save();
            path(); g.clip();
            art();
            // Brillo del vinilo
            const gl = g.createLinearGradient(-200, -200, 200, 200);
            gl.addColorStop(0, 'rgba(255,255,255,0)');
            gl.addColorStop(.42, 'rgba(255,255,255,.22)');
            gl.addColorStop(.5, 'rgba(255,255,255,.05)');
            gl.addColorStop(1, 'rgba(255,255,255,0)');
            g.fillStyle = gl;
            g.fillRect(-400, -400, 800, 800);
            g.restore();
            g.lineWidth = 4;
            g.strokeStyle = '#334155';
            path(); g.stroke();
            // Esquina despegada
            if (opts.peel) {
                const [px, py, s] = opts.peel;
                g.fillStyle = 'rgba(80,30,20,.25)';
                g.beginPath(); g.moveTo(px - s, py); g.lineTo(px, py); g.lineTo(px, py + s); g.closePath(); g.fill();
                g.fillStyle = '#F1F5F9';
                g.strokeStyle = '#334155';
                g.lineWidth = 3;
                g.beginPath(); g.moveTo(px - s, py); g.quadraticCurveTo(px - s * .35, py + s * .35, px, py + s); g.lineTo(px - s * .15, py + s * .15); g.closePath(); g.fill(); g.stroke();
            }
            g.restore();
        }
        // Logos de tecnologías (los mismos de wilmeralama.com)
        const LOGO_FILES = {
            java: 'Java', spring: 'Spring', csharp: 'C-(CSharp)', net: 'NET-core', ts: 'TypeScript',
            angular: 'Angular', docker: 'Docker', postgres: 'PostgresSQL', node: 'Node.js', php: 'PHP',
        };
        const logos = {};
        // Silueta del logo engrosada `border` px y teñida: es el troquel del vinilo
        function dieCut(img, size, border, color) {
            const pad = border + 4, S = size + pad * 2;
            const c = document.createElement('canvas');
            c.width = c.height = S;
            const g = c.getContext('2d');
            for (let i = 0; i < 36; i++) {
                const a = i / 36 * Math.PI * 2;
                g.drawImage(img, pad + Math.cos(a) * border, pad + Math.sin(a) * border, size, size);
            }
            g.drawImage(img, pad, pad, size, size);
            g.globalCompositeOperation = 'source-in';
            g.fillStyle = color;
            g.fillRect(0, 0, S, S);
            return c;
        }
        // El logo con el brillo del vinilo encima (solo sobre sus píxeles)
        function glossed(img, size) {
            const c = document.createElement('canvas');
            c.width = c.height = size;
            const g = c.getContext('2d');
            g.drawImage(img, 0, 0, size, size);
            g.globalCompositeOperation = 'source-atop';
            const gl = g.createLinearGradient(0, 0, size, size);
            gl.addColorStop(0, 'rgba(255,255,255,0)');
            gl.addColorStop(.42, 'rgba(255,255,255,.2)');
            gl.addColorStop(.5, 'rgba(255,255,255,.04)');
            gl.addColorStop(1, 'rgba(255,255,255,0)');
            g.fillStyle = gl;
            g.fillRect(0, 0, size, size);
            return c;
        }
        const cutCache = new Map();
        function cutsFor(key, size, border) {
            const id = key + size + border;
            if (!cutCache.has(id)) {
                const img = logos[key];
                cutCache.set(id, {
                    edge: dieCut(img, size, 17, '#334155'),
                    white: dieCut(img, size, 14, border),
                    bump: dieCut(img, size, 15, '#a8a8a8'),
                    rough: dieCut(img, size, 15, '#3a3a3a'),
                    art: glossed(img, size),
                });
            }
            return cutCache.get(id);
        }
        // Sticker troquelado con la forma del logo (borde de color + contorno fino)
        function logoSticker(g, mode, x, y, rot, key, size, border = '#FFFFFF') {
            if (!logos[key]) return;
            const c = cutsFor(key, size, border);
            const at = cv => g.drawImage(cv, -cv.width / 2, -cv.height / 2);
            g.save();
            g.translate(x, y);
            g.rotate(rot);
            if (mode !== 'color') {
                at(mode === 'bump' ? c.bump : c.rough);
                g.restore();
                return;
            }
            g.shadowColor = 'rgba(60,20,10,.3)';
            g.shadowBlur = 12;
            g.shadowOffsetY = 6;
            at(c.edge);
            g.shadowColor = 'transparent';
            at(c.white);
            at(c.art);
            g.restore();
        }
        // Logo dentro de un sticker con forma propia (para logos de líneas finas)
        const logoArt = (g, key, w, h = w, dx = 0, dy = 0) => () => {
            if (logos[key]) g.drawImage(logos[key], -w / 2 + dx, -h / 2 + dy, w, h);
        };

        const T = (g, t, x, y, font, color, align = 'center') => {
            g.fillStyle = color;
            g.font = font;
            g.textAlign = align;
            g.textBaseline = 'middle';
            g.fillText(t, x, y);
        };
        const rr = (g, w, h, r) => () => { g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, r); };
        const circ = (g, r) => () => { g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); };
        const arcTextL = (g, text, r, bottom) => {
            const chars = [...text];
            const widths = chars.map(ch => g.measureText(ch).width + 2);
            const total = widths.reduce((a, b) => a + b, 0);
            let acc = 0;
            chars.forEach((ch, i) => {
                const a = (acc + widths[i] / 2 - total / 2) / r;
                g.save();
                g.rotate(bottom ? -a : a);
                g.fillText(ch, 0, bottom ? r : -r);
                g.restore();
                acc += widths[i];
            });
        };

        function drawFrontInto(mode) {
            const { g, tex } = faces.front[mode];
            g.setTransform(1, 0, 0, 1, 0, 0);
            shell(g, mode);

            // Logos reales del stack como stickers de vinilo
            // Pegados a lo largo de los viajes: rotaciones y tamaños dispares, algunos se enciman
            sticker(g, mode, 330, 300, -.2, rr(g, 290, 185, 26), '#BAE6FD', logoArt(g, 'docker', 250, 250, 0, 6));
            logoSticker(g, mode, 180, 525, .25, 'java', 220);
            logoSticker(g, mode, 525, 515, .28, 'csharp', 225);
            sticker(g, mode, 830, 480, -.18, rr(g, 185, 185, 24), '#FFFFFF', logoArt(g, 'ts', 150), { peel: [92, -92, 34] });
            sticker(g, mode, 360, 775, -.3, circ(g, 108), '#1E293B', logoArt(g, 'angular', 150, 150, 0, 2));
            logoSticker(g, mode, 700, 760, .35, 'net', 175, '#DDD6FE');
            sticker(g, mode, 190, 975, -.15, circ(g, 92), '#14532D', logoArt(g, 'spring', 125));
            sticker(g, mode, 520, 1000, .12, circ(g, 115), '#FFFFFF', logoArt(g, 'postgres', 165, 165, 0, 2));
            logoSticker(g, mode, 850, 965, -.25, 'node', 175, '#1E293B');
            // Etiqueta de prioridad GDS
            sticker(g, mode, 470, 1285, -.07, rr(g, 680, 170, 14), '#FFFFFF', () => {
                g.fillStyle = '#DC2626';
                g.fillRect(-340, -85, 680, 50);
                T(g, 'PRIORITY · GDS', -150, -60, `700 26px ${MONO_L}`, '#FFFFFF');
                T(g, '✈ LIM', 250, -60, `700 24px ${MONO_L}`, '#FFFFFF');
                T(g, 'Sabre · Amadeus · NDC', -40, 18, `700 38px ${MONO_L}`, '#1E293B');
                g.fillStyle = '#1E293B';
                for (let bx = 230, i = 0; bx < 320; i++) {
                    const w = [3, 2, 5, 2, 4][i % 5];
                    g.fillRect(bx, -10, w, 66);
                    bx += w + [3, 4, 2][i % 3];
                }
            });
            // PHP pegado encima de la esquina de la etiqueta
            logoSticker(g, mode, 860, 1205, .3, 'php', 215, '#E0E7FF');
            tex.needsUpdate = true;
        }

        function drawBackInto(mode) {
            const { g, tex } = faces.back[mode];
            g.setTransform(1, 0, 0, 1, 0, 0);
            shell(g, mode);
            // Sello de la República de Vuelos con el globo
            sticker(g, mode, 512, 470, .05, circ(g, 210), '#1B3557', () => {
                g.strokeStyle = '#E2BE62';
                g.fillStyle = '#E2BE62';
                g.lineWidth = 5;
                g.beginPath(); g.arc(0, 0, 188, 0, Math.PI * 2); g.stroke();
                g.font = `700 28px ${SERIF_L}`;
                arcTextL(g, 'REPÚBLICA DE VUELOS', 152);
                g.font = `600 20px ${MONO_L}`;
                arcTextL(g, 'WORLD TRAVELER · WA-2015', 152, true);
                g.lineWidth = 12;
                const R = 86;
                g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.stroke();
                g.save();
                g.beginPath(); g.arc(0, 0, R - 2, 0, Math.PI * 2); g.clip();
                g.beginPath(); g.moveTo(0, -R); g.lineTo(0, R); g.stroke();
                g.beginPath(); g.ellipse(0, 0, R * .5, R, 0, 0, Math.PI * 2); g.stroke();
                g.beginPath(); g.moveTo(-R, 0); g.lineTo(R, 0); g.stroke();
                g.beginPath(); g.moveTo(-R, -R * .62); g.quadraticCurveTo(0, -R * .26, R, -R * .62); g.stroke();
                g.beginPath(); g.moveTo(-R, R * .62); g.quadraticCurveTo(0, R * .26, R, R * .62); g.stroke();
                g.restore();
            });
            // Frágil
            sticker(g, mode, 512, 960, -.05, rr(g, 620, 160, 12), '#FEF2F2', () => {
                g.strokeStyle = '#DC2626';
                g.lineWidth = 6;
                g.strokeRect(-290, -62, 580, 124);
                T(g, 'FRÁGIL', 0, -18, `800 56px ${MONO_L}`, '#DC2626');
                T(g, 'CÓDIGO EN TRÁNSITO · NO GOLPEAR', 0, 34, `600 20px ${MONO_L}`, '#991B1B');
            });
            // Aeropuerto de origen y un saludo
            sticker(g, mode, 270, 1230, -.12, circ(g, 92), '#BBF7D0', () => {
                T(g, 'LIM', 0, -8, `800 52px ${MONO_L}`, '#166534');
                T(g, 'LIMA · PERÚ', 0, 36, `600 15px ${MONO_L}`, '#166534');
            });
            sticker(g, mode, 740, 1230, .1, rr(g, 330, 120, 60), '#FFFFFF', () => {
                T(g, 'Hello, World!', 0, 4, `700 54px ${HAND_L}`, '#2B6CB0');
            });
            tex.needsUpdate = true;
        }

        // ---------- Etiqueta de equipaje (cartón kraft) ----------
        const tagCanvas = document.createElement('canvas');
        tagCanvas.width = 300;
        tagCanvas.height = 460;
        const tagTex = new THREE.CanvasTexture(tagCanvas);
        tagTex.colorSpace = THREE.SRGBColorSpace;
        function drawTag() {
            const g = tagCanvas.getContext('2d');
            g.fillStyle = '#F2E2C0';
            g.fillRect(0, 0, 300, 460);
            // Fibras del cartón
            const rand = seeded(9);
            for (let i = 0; i < 260; i++) {
                g.strokeStyle = `rgba(150,110,60,${.05 + rand() * .1})`;
                g.lineWidth = 1;
                const x = rand() * 300, y = rand() * 460;
                g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rand() - .5) * 18, y + (rand() - .5) * 6); g.stroke();
            }
            g.fillStyle = '#D9C49C';
            g.beginPath(); g.arc(150, 52, 30, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#1E293B';
            g.beginPath(); g.arc(150, 52, 14, 0, Math.PI * 2); g.fill();
            g.strokeStyle = '#334155'; g.lineWidth = 3;
            g.beginPath(); g.arc(150, 52, 30, 0, Math.PI * 2); g.stroke();
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillStyle = '#64748B'; g.font = `600 20px ${MONO_L}`; g.fillText('VUELO', 150, 116);
            g.fillStyle = '#1E293B'; g.font = `700 50px ${MONO_L}`; g.fillText('WA-2015', 150, 160);
            g.fillStyle = '#DC2626'; g.fillRect(24, 196, 252, 4);
            g.fillStyle = '#1E293B'; g.font = `700 44px ${MONO_L}`; g.fillText('LIM ✈ GDS', 150, 244);
            g.fillStyle = '#64748B'; g.font = `600 19px ${MONO_L}`; g.fillText('ALAMA/WILMER', 150, 304);
            g.fillStyle = '#1E293B';
            for (let x = 50, i = 0; x < 250; i++) {
                const w = [3, 2, 5, 2, 3, 6, 2][i % 7];
                g.fillRect(x, 340, w, 66);
                x += w + [3, 4, 2, 5, 3][i % 5];
            }
            g.fillStyle = '#64748B'; g.font = `600 14px ${MONO_L}`; g.fillText('0 145 2015 1203', 150, 424);
            tagTex.needsUpdate = true;
        }

        const drawAllL = () => {
            for (const mode of ['color', 'bump', 'rough']) { drawFrontInto(mode); drawBackInto(mode); }
            drawTag();
        };
        drawAllL();
        Promise.all(Object.entries(LOGO_FILES).map(([key, file]) => new Promise(res => {
            const img = new Image();
            img.onload = () => { logos[key] = img; res(); };
            img.onerror = () => res();
            img.src = `/images/technologies/${file}.png`;
        }))).then(drawAllL);
        document.fonts && Promise.all([`700 84px ${HAND_L}`, `800 82px ${MONO_L}`, `600 17px ${MONO_L}`, `700 28px ${SERIF_L}`]
            .map(f => document.fonts.load(f))).then(drawAllL).catch(() => {});

        // ---------- Maleta ----------
        const tilt = new THREE.Group();
        scene.add(tilt);
        const faceMat = f => stdL(0xffffff, {
            map: f.color.tex, bumpMap: f.bump.tex, bumpScale: 2.5, roughnessMap: f.rough.tex, roughness: 1,
        });
        const side = stdL(0xda6c51, { roughness: .4 });
        const body = withOutlineL(new THREE.Mesh(new RoundedBoxGeometry(BW, BH, BD, 4, .14),
            [side, side, side, side, faceMat(faces.front), faceMat(faces.back)]));
        tilt.add(body);
        // Cierre perimetral
        // Franja que sigue la misma curva de las esquinas: un marco extruido, al ras de la carcasa
        const roundedRect = (w, h, r) => {
            const sh = new THREE.Shape();
            sh.moveTo(-w / 2 + r, -h / 2);
            sh.lineTo(w / 2 - r, -h / 2); sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
            sh.lineTo(w / 2, h / 2 - r); sh.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
            sh.lineTo(-w / 2 + r, h / 2); sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
            sh.lineTo(-w / 2, -h / 2 + r); sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
            return sh;
        };
        const zipShape = roundedRect(BW + .01, BH + .01, .145);
        zipShape.holes.push(roundedRect(BW - .06, BH - .06, .12));
        const zipGeo = new THREE.ExtrudeGeometry(zipShape, { depth: .035, bevelEnabled: false, curveSegments: 16 });
        zipGeo.translate(0, 0, -.0175);
        const zip = new THREE.Mesh(zipGeo, stdL(0x6b3324, { roughness: .8 }));
        zip.position.z = -.06;
        tilt.add(zip);

        const metal = stdL(0xd1d9e3, { metalness: 1, roughness: .28, envMapIntensity: 1 });
        const plastic = stdL(0x1e293b, { roughness: .55 });
        const rubber = stdL(0x111827, { roughness: .85 });
        // Manija extensible (atrás)
        for (const x of [-.34, .34]) {
            const rod = withOutlineL(new THREE.Mesh(new THREE.CylinderGeometry(.028, .028, .62, 16), metal));
            rod.position.set(x, BH / 2 + .3, -BD / 2 + .1);
            tilt.add(rod);
        }
        const grip = withOutlineL(new THREE.Mesh(new RoundedBoxGeometry(.84, .1, .13, 2, .045), plastic));
        grip.position.set(0, BH / 2 + .62, -BD / 2 + .1);
        tilt.add(grip);
        // Asa superior
        const topHandle = withOutlineL(new THREE.Mesh(new RoundedBoxGeometry(.5, .08, .13, 2, .035), plastic));
        topHandle.position.set(0, BH / 2 + .13, .04);
        tilt.add(topHandle);
        for (const x of [-.22, .22]) {
            const post = withOutlineL(new THREE.Mesh(new RoundedBoxGeometry(.08, .12, .11, 2, .02), plastic));
            post.position.set(x, BH / 2 + .05, .04);
            tilt.add(post);
        }
        // Protectores de esquina y ruedas
        for (const x of [-(BW / 2 - .17), BW / 2 - .17]) {
            for (const z of [-(BD / 2 - .13), BD / 2 - .13]) {
                const guard = withOutlineL(new THREE.Mesh(new RoundedBoxGeometry(.26, .14, .2, 2, .05), plastic));
                guard.position.set(x + Math.sign(x) * .05, -BH / 2 + .04, z + Math.sign(z) * .04);
                tilt.add(guard);
                const housing = withOutlineL(new THREE.Mesh(new RoundedBoxGeometry(.2, .1, .16, 2, .03), plastic));
                housing.position.set(x, -BH / 2 - .04, z);
                tilt.add(housing);
                const wheel = withOutlineL(new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .08, 24).rotateZ(Math.PI / 2), rubber));
                wheel.position.set(x, -BH / 2 - .12, z);
                tilt.add(wheel);
                const hub = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .085, 16).rotateZ(Math.PI / 2), metal);
                hub.position.copy(wheel.position);
                tilt.add(hub);
            }
        }
        // Etiqueta amarrada al asa con un cordón rojo
        const cordMat = stdL(0xd7263d, { roughness: .75 });
        const CORD = .012;
        // Lazo alrededor de la barra del asa superior
        const handleY = BH / 2 + .13, handleZ = .04, loopX = .12;
        const loopPts = [];
        for (let i = 0; i < 16; i++) {
            const a = i / 16 * Math.PI * 2;
            loopPts.push(new THREE.Vector3(loopX + Math.sin(a) * .008, handleY + Math.cos(a) * .062, handleZ + Math.sin(a) * .082));
        }
        tilt.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loopPts, true), 48, CORD, 8, true), cordMat));
        // Nudo y tramo que cruza la tapa y baja por el borde redondeado (radio .14 + grosor)
        const knotAt = new THREE.Vector3(loopX, handleY - .044, handleZ + .058);
        const knot = new THREE.Mesh(new THREE.SphereGeometry(.022, 16, 12), cordMat);
        knot.position.copy(knotAt);
        tilt.add(knot);
        const edge = a => new THREE.Vector3(0, BH / 2 - .14 + Math.cos(a) * .155, BD / 2 - .14 + Math.sin(a) * .155);
        const hangAt = edge(1.22).setX(.5);
        tilt.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
            knotAt,
            new THREE.Vector3(.2, BH / 2 + .018, .16),
            edge(0).setX(.3),
            edge(.52).setX(.4),
            edge(.88).setX(.47),
            hangAt,
        ]), 48, CORD, 8), cordMat));

        // La etiqueta se mece desde donde el cordón deja el borde
        const tagPivot = new THREE.Group();
        tagPivot.position.copy(hangAt);
        tilt.add(tagPivot);
        tagPivot.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -.04, .026), new THREE.Vector3(0, -.072, .036),
        ]), 16, CORD, 8), cordMat));
        // Argolla de cordón pasando por el ojal de la etiqueta
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.024, CORD * .9, 8, 24), cordMat);
        ring.rotation.y = Math.PI / 2;
        ring.position.set(0, -.088, .036);
        tagPivot.add(ring);
        const kraft = stdL(0xf2e2c0, { roughness: .95 });
        const tag = withOutlineL(new THREE.Mesh(new RoundedBoxGeometry(.3, .46, .014, 1, .005),
            [kraft, kraft, kraft, kraft, stdL(0xffffff, { map: tagTex, roughness: .95 }), kraft]));
        tag.position.set(0, -.27, .036);
        tagPivot.add(tag);

        // ---------- Interacción ----------
        const st = { tx: 0, ty: 0, rx: 0, ry: 0, visible: false, w: 0, h: 0 };
        box.addEventListener('pointermove', e => {
            const r = box.getBoundingClientRect();
            st.ty = ((e.clientX - r.left) / r.width - .5) * .5;
            st.tx = ((e.clientY - r.top) / r.height - .5) * .12;
        });
        box.addEventListener('pointerleave', () => { st.tx = st.ty = 0; });
        new IntersectionObserver(([entry]) => { st.visible = entry.isIntersecting; }).observe(cv);

        // Arrastrar para girarla; al soltar sigue por inercia y vuelve suave al frente
        const spin = { yaw: 0, pitch: 0, vYaw: 0, dragging: false, x: 0, y: 0, released: -1e9 };
        box.style.cursor = 'grab';
        box.style.touchAction = 'pan-y';
        box.addEventListener('pointerdown', e => {
            spin.dragging = true;
            spin.x = e.clientX;
            spin.y = e.clientY;
            spin.vYaw = 0;
            box.setPointerCapture(e.pointerId);
            box.style.cursor = 'grabbing';
        });
        box.addEventListener('pointermove', e => {
            if (!spin.dragging) return;
            const dx = (e.clientX - spin.x) * .012, dy = (e.clientY - spin.y) * .006;
            spin.yaw += dx;
            spin.pitch = clamp(spin.pitch + dy, -.45, .45);
            spin.vYaw = clamp(lerp(spin.vYaw, dx, .5), -.2, .2);
            spin.x = e.clientX;
            spin.y = e.clientY;
        });
        const endSpin = () => {
            if (!spin.dragging) return;
            spin.dragging = false;
            spin.released = performance.now();
            box.style.cursor = 'grab';
        };
        box.addEventListener('pointerup', endSpin);
        box.addEventListener('pointercancel', endSpin);
        tilt.rotation.order = 'YXZ';

        renderLuggage = t => {
            if (!st.visible) return;
            // El lienzo es más grande que la caja: al girarla, las esquinas no se cortan
            const cw = cv.clientWidth, ch = cv.clientHeight;
            if (cw !== st.w || ch !== st.h) {
                st.w = cw;
                st.h = ch;
                lr.setPixelRatio(Math.min(devicePixelRatio, 2));
                lr.setSize(cw, ch, false);
                cam.aspect = cw / ch;
                cam.updateProjectionMatrix();
            }
            const w = box.clientWidth, h = box.clientHeight;
            st.rx += (st.tx - st.rx) * .07;
            st.ry += (st.ty - st.ry) * .07;
            const sway = reduceMotion ? 0 : Math.sin(t * .0006) * .1;
            if (!spin.dragging) {
                spin.yaw += spin.vYaw;
                spin.vYaw *= .93;
                if (t - spin.released > 1400 || reduceMotion) {
                    const turn = Math.PI * 2;
                    spin.yaw += (Math.round(spin.yaw / turn) * turn - spin.yaw) * .04;
                    spin.pitch *= .92;
                }
            }
            tilt.rotation.set(.08 + st.rx + spin.pitch, -.5 + sway + st.ry + spin.yaw, 0);
            // La etiqueta se balancea con el movimiento y con el giro
            tagPivot.rotation.z = reduceMotion ? 0 : Math.sin(t * .0018) * .08 - (st.ry - st.ty) * .6 - spin.vYaw * 2.5;

            const tanH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
            const needH = 2.8, needW = 2.3;
            const d = ch / (2 * tanH) * Math.max(needH / h, needW / w);
            cam.position.set(0, .35, d);
            cam.lookAt(0, .22, 0);
            lr.render(scene, cam);
        };
    })();
    return renderLuggage;
}
