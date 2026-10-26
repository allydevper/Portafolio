import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { $, clamp, lerp, ease, reduceMotion, seeded, loadMascot, shadersReady } from './util.js';

export function initPassport() {
    // ================= PASAPORTE 3D =================
    // Libreta con tapa que gira sobre el lomo, páginas pintadas en canvas y un sello de goma que estampa "APROBADO"
    let renderPassport = () => {};
    (() => {
        const box = $('#passport3d');
        let pr = null;
        try {
            pr = new THREE.WebGLRenderer({ canvas: $('#passportCanvas'), alpha: true, antialias: true });
        } catch (err) {
            pr = null;
        }
        if (!pr) {
            box.remove();
            $('#passportHint').remove();
            $('#passportFlat').classList.replace('sr-only', 'relative');
            return;
        }

        const scene = new THREE.Scene();
        const cam = new THREE.PerspectiveCamera(26, 1, .1, 50);
        scene.add(new THREE.AmbientLight(0xffffff, 1.2));
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
        keyLight.position.set(-1, 2, 3);
        scene.add(keyLight);

        const tg = new THREE.DataTexture(new Uint8Array([140, 205, 255]), 3, 1, THREE.RedFormat);
        tg.minFilter = tg.magFilter = THREE.NearestFilter;
        tg.needsUpdate = true;
        const toonP = color => new THREE.MeshToonMaterial({ color, gradientMap: tg });
        const outlineP = new THREE.ShaderMaterial({
            uniforms: { color: { value: new THREE.Color(0x24395c) }, thickness: { value: .0045 } },
            vertexShader: 'uniform float thickness; void main(){ vec3 p = position + normal * thickness; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
            fragmentShader: 'uniform vec3 color; void main(){ gl_FragColor = vec4(color, 1.0); }',
            side: THREE.BackSide,
        });
        const withOutline = mesh => {
            let og = mesh.geometry.clone();
            og.deleteAttribute('normal');
            if (og.attributes.uv) og.deleteAttribute('uv');
            og.clearGroups();
            og = mergeVertices(og);
            og.computeVertexNormals();
            mesh.add(new THREE.Mesh(og, outlineP));
            return mesh;
        };

        // ---------- Páginas pintadas en canvas ----------
        const PW = 1, PH = 1.367, CW = 1024, CH = 1400;
        const MONO = '"IBM Plex Mono", monospace', SERIF = '"Playfair Display", serif', HAND = '"Caveat", cursive', SANS = '"Plus Jakarta Sans", sans-serif';
        const makePage = () => {
            const c = document.createElement('canvas');
            c.width = CW;
            c.height = CH;
            const tex = new THREE.CanvasTexture(c);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = pr.capabilities.getMaxAnisotropy();
            return { g: c.getContext('2d'), tex };
        };
        const spaced = (g, text, x, y, spacing, align = 'left') => {
            g.letterSpacing = spacing + 'px';
            g.textAlign = align;
            g.fillText(text, x, y);
            g.letterSpacing = '0px';
        };
        const wrapText = (g, text, x, y, maxW, lh) => {
            let line = '';
            for (const w of text.split(' ')) {
                const test = line ? line + ' ' + w : w;
                if (g.measureText(test).width > maxW && line) {
                    g.fillText(line, x, y);
                    line = w;
                    y += lh;
                } else line = test;
            }
            if (line) g.fillText(line, x, y);
            return y;
        };
        // Papel de seguridad: guilloché y líneas onduladas
        // Sombra del lomo (pliegue central). La derecha es más honda: tiene más hojas debajo
        const gutter = (g, side, strength) => {
            const x0 = side === 'right' ? CW : 0, dir = side === 'right' ? -1 : 1;
            const sh = g.createLinearGradient(x0, 0, x0 + dir * 150, 0);
            sh.addColorStop(0, `rgba(30,41,59,${strength})`);
            sh.addColorStop(.35, `rgba(30,41,59,${strength * .35})`);
            sh.addColorStop(1, 'rgba(30,41,59,0)');
            g.save();
            g.globalAlpha = 1;
            g.globalCompositeOperation = 'source-over';
            g.fillStyle = sh;
            g.fillRect(side === 'right' ? CW - 150 : 0, 0, 150, CH);
            // Brillo suave donde la hoja empieza a curvarse
            const hl = g.createLinearGradient(x0 + dir * 150, 0, x0 + dir * 230, 0);
            hl.addColorStop(0, 'rgba(255,255,255,0)');
            hl.addColorStop(.5, 'rgba(255,255,255,.18)');
            hl.addColorStop(1, 'rgba(255,255,255,0)');
            g.fillStyle = hl;
            g.fillRect(side === 'right' ? CW - 230 : 150, 0, 80, CH);
            g.restore();
        };
        const paper = g => {
            g.textAlign = 'left';
            g.textBaseline = 'alphabetic';
            g.fillStyle = '#F7F1E3';
            g.fillRect(0, 0, CW, CH);
            g.lineWidth = 1.4;
            for (let r = 40; r < 1700; r += 26) {
                g.strokeStyle = 'rgba(43,108,176,.07)';
                g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke();
                g.strokeStyle = 'rgba(229,62,62,.05)';
                g.beginPath(); g.arc(CW, CH, r, 0, Math.PI * 2); g.stroke();
            }
            g.strokeStyle = 'rgba(43,108,176,.05)';
            for (let y = 60; y < CH; y += 64) {
                g.beginPath();
                for (let x = 0; x <= CW; x += 8) g.lineTo(x, y + Math.sin(x / 40 + y) * 9);
                g.stroke();
            }
        };

        // Página de datos (interior de la tapa)
        const data = makePage();
        let mascotImg = null;
        function drawDataPage() {
            const g = data.g;
            paper(g);
            g.fillStyle = '#64748B';
            g.font = `500 26px ${MONO}`;
            spaced(g, 'REPÚBLICA DE VUELOS', 70, 100, 6);
            spaced(g, 'PASAPORTE', CW - 70, 100, 6, 'right');
            g.strokeStyle = 'rgba(100,116,139,.3)';
            g.lineWidth = 2;
            g.beginPath(); g.moveTo(70, 126); g.lineTo(CW - 70, 126); g.stroke();

            [['TIPO', 'P', 410], ['CÓDIGO', 'RDV', 540], ['N.º PASAPORTE', 'WA2015', 700]].forEach(([l, v, x]) => {
                g.fillStyle = '#94A3B8'; g.font = `500 21px ${MONO}`; spaced(g, l, x, 176, 3);
                g.fillStyle = '#1E293B'; g.font = `600 35px ${MONO}`; g.fillText(v, x, 216);
            });

            // Foto
            g.save();
            g.translate(220, 380);
            g.rotate(-.035);
            g.shadowColor = 'rgba(15,23,42,.2)'; g.shadowBlur = 20; g.shadowOffsetY = 8;
            g.fillStyle = '#ffffff';
            g.beginPath(); g.roundRect(-152, -200, 304, 400, 14); g.fill();
            g.shadowColor = 'transparent';
            g.fillStyle = '#E0F2FE';
            g.beginPath(); g.roundRect(-140, -188, 280, 376, 8); g.fill();
            if (mascotImg) {
                g.imageSmoothingEnabled = false;
                g.drawImage(mascotImg, -115, -115, 230, 230);
                g.imageSmoothingEnabled = true;
            }
            g.restore();

            [['APELLIDOS / SURNAME', 'ALAMA'], ['NOMBRES / GIVEN NAMES', 'WILMER'], ['PROFESIÓN', 'Sr. Software Engineer'],
             ['BASE', 'Lima, Perú · UTC-5'], ['EN TRAVEL DESDE', '2015'], ['MODALIDAD', 'Remoto']].forEach(([l, v], i) => {
                const y = 282 + i * 94;
                g.fillStyle = '#94A3B8'; g.font = `500 21px ${MONO}`; spaced(g, l, 410, y, 3);
                g.fillStyle = '#1E293B'; g.font = `${i < 2 ? 600 : 500} 36px ${MONO}`; g.fillText(v, 410, y + 44);
            });

            // Firma
            g.fillStyle = '#94A3B8'; g.font = `500 21px ${MONO}`; spaced(g, 'FIRMA DEL TITULAR', 70, 850, 3);
            g.save(); g.translate(80, 940); g.rotate(-.05);
            g.fillStyle = '#334155'; g.font = `700 90px ${HAND}`; g.fillText('Wilmer Alama', 0, 0);
            g.restore();
            g.strokeStyle = 'rgba(100,116,139,.35)';
            g.beginPath(); g.moveTo(70, 970); g.lineTo(540, 970); g.stroke();

            [['EXPEDICIÓN', '2015', 70], ['VENCIMIENTO', 'Sin fecha', 350]].forEach(([l, v, x]) => {
                g.fillStyle = '#94A3B8'; g.font = `500 21px ${MONO}`; spaced(g, l, x, 1036, 3);
                g.fillStyle = '#1E293B'; g.font = `500 32px ${MONO}`; g.fillText(v, x, 1076);
            });

            // Foto fantasma, como en los pasaportes reales
            if (mascotImg) {
                g.save();
                g.globalAlpha = .12;
                g.imageSmoothingEnabled = false;
                g.drawImage(mascotImg, 770, 860, 180, 180);
                g.restore();
            }

            // Zona de lectura mecánica (MRZ)
            g.fillStyle = 'rgba(255,255,255,.45)';
            g.fillRect(0, 1130, CW, 210);
            g.fillStyle = '#334155';
            g.font = `600 36px ${MONO}`;
            spaced(g, 'P<RDV<ALAMA<<WILMER<<<<<<<<<<<', 70, 1215, 5);
            spaced(g, 'WA2015<GDS<NDC<SABRE<AMADEUS<1', 70, 1290, 5);
            gutter(g, 'right', .15);
            data.tex.needsUpdate = true;
        }

        // Página de visados
        const visa = makePage();
        let approved = false;
        const STAMP_AT = { x: 690, y: 1215, rot: -.22 };

        // Cada sello se dibuja en su propio canvas, se "gasta" la tinta y se imprime sobre el papel
        const makeStamp = (w, h, color, seed, draw) => {
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            const g = c.getContext('2d');
            g.translate(w / 2, h / 2);
            g.strokeStyle = color;
            g.fillStyle = color;
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            draw(g);
            // Tinta gastada: grano, raspones y un lado con menos presión
            const rand = seeded(seed);
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.globalCompositeOperation = 'destination-out';
            g.fillStyle = '#000';
            g.strokeStyle = '#000';
            for (let i = 0; i < w * h / 90; i++) {
                g.globalAlpha = .25 + rand() * .75;
                g.beginPath();
                g.arc(rand() * w, rand() * h, .5 + rand() * 1.8, 0, Math.PI * 2);
                g.fill();
            }
            g.lineWidth = 1.5;
            for (let i = 0; i < 10; i++) {
                const x = rand() * w, y = rand() * h;
                g.globalAlpha = .6;
                g.beginPath();
                g.moveTo(x, y);
                g.lineTo(x + (rand() - .5) * 90, y + (rand() - .5) * 18);
                g.stroke();
            }
            const fade = g.createLinearGradient(0, 0, w, h * .6);
            fade.addColorStop(0, 'rgba(0,0,0,0)');
            fade.addColorStop(1, `rgba(0,0,0,${.2 + rand() * .2})`);
            g.globalAlpha = 1;
            g.fillStyle = fade;
            g.fillRect(0, 0, w, h);
            return c;
        };
        const printStamp = (g, stampCanvas, x, y, rot, alpha = .82) => {
            g.save();
            g.translate(x, y);
            g.rotate(rot);
            g.globalAlpha = alpha;
            g.globalCompositeOperation = 'multiply';
            g.drawImage(stampCanvas, -stampCanvas.width / 2, -stampCanvas.height / 2);
            g.restore();
        };
        // Texto en arco (arriba se lee de izquierda a derecha; abajo también)
        const arcText = (g, text, r, bottom = false) => {
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
        const planeIcon = (g, x, y, size) => {
            g.save();
            g.translate(x - size / 2, y - size * .3);
            g.scale(size / 370, size / 370);
            g.translate(-80, -30);
            for (const d of PLANE_PATHS) g.fill(new Path2D(d));
            g.restore();
        };
        const notchedRect = (g, w, h, n) => {
            g.beginPath();
            g.moveTo(-w / 2 + n, -h / 2); g.lineTo(w / 2 - n, -h / 2); g.lineTo(w / 2, -h / 2 + n);
            g.lineTo(w / 2, h / 2 - n); g.lineTo(w / 2 - n, h / 2); g.lineTo(-w / 2 + n, h / 2);
            g.lineTo(-w / 2, h / 2 - n); g.lineTo(-w / 2, -h / 2 + n); g.closePath();
        };

        const buildStamps = () => ({
            sabre: makeStamp(320, 320, '#C81E45', 11, g => {
                g.lineWidth = 7; g.beginPath(); g.arc(0, 0, 148, 0, Math.PI * 2); g.stroke();
                g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, 136, 0, Math.PI * 2); g.stroke();
                g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 84, 0, Math.PI * 2); g.stroke();
                g.font = `700 26px ${MONO}`;
                arcText(g, 'SABRE · GDS · LIMA', 110);
                arcText(g, 'NDC ✦ SABRE 360', 110, true);
                planeIcon(g, 0, -26, 92);
                g.font = `700 34px ${MONO}`; g.fillText('2018', 0, 32);
                g.font = `700 22px ${MONO}`; g.fillText('✦', -110, 0); g.fillText('✦', 110, 0);
            }),
            amadeus: makeStamp(360, 200, '#1D5FA8', 23, g => {
                g.lineWidth = 6; notchedRect(g, 340, 180, 20); g.stroke();
                g.lineWidth = 2; g.setLineDash([10, 7]); notchedRect(g, 312, 152, 14); g.stroke(); g.setLineDash([]);
                g.font = `700 46px ${MONO}`; g.letterSpacing = '4px'; g.fillText('AMADEUS', 2, -28); g.letterSpacing = '0px';
                g.lineWidth = 2; g.beginPath(); g.moveTo(-126, 4); g.lineTo(126, 4); g.stroke();
                g.font = `600 22px ${MONO}`; g.fillText('EMISIÓN · PNR', 0, 30);
                g.font = `600 17px ${MONO}`; g.fillText('LIM ✈ 2018 · ADMITIDO', 0, 58);
            }),
            iata: makeStamp(340, 220, '#0F7A55', 37, g => {
                g.lineWidth = 7; g.beginPath(); g.ellipse(0, 0, 160, 98, 0, 0, Math.PI * 2); g.stroke();
                g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, 0, 146, 84, 0, 0, Math.PI * 2); g.stroke();
                g.font = `600 15px ${MONO}`; g.fillText('BILLING & SETTLEMENT', 0, -52);
                g.font = `800 46px ${MONO}`; g.fillText('IATA BSP', 0, -6);
                g.lineWidth = 2; g.beginPath(); g.moveTo(-96, 22); g.lineTo(96, 22); g.stroke();
                g.font = `600 20px ${MONO}`; g.fillText('VOID · REFUND', 0, 46);
            }),
            edifact: makeStamp(290, 150, '#B5651D', 51, g => {
                const hex = (w, h, k) => {
                    g.beginPath();
                    g.moveTo(-w / 2, 0); g.lineTo(-w / 2 + k, -h / 2); g.lineTo(w / 2 - k, -h / 2);
                    g.lineTo(w / 2, 0); g.lineTo(w / 2 - k, h / 2); g.lineTo(-w / 2 + k, h / 2); g.closePath();
                };
                g.lineWidth = 6; hex(270, 128, 34); g.stroke();
                g.lineWidth = 2; hex(244, 104, 28); g.stroke();
                g.font = `700 38px ${MONO}`; g.fillText('EDIFACT', 0, -12);
                g.font = `600 16px ${MONO}`; g.fillText('ENTRADA ✈ 2015', 0, 26);
            }),
            approved: makeStamp(440, 180, '#D62828', 67, g => {
                g.lineWidth = 8; g.strokeRect(-205, -78, 410, 156);
                g.lineWidth = 3; g.strokeRect(-191, -64, 382, 128);
                g.font = `600 17px ${MONO}`; g.letterSpacing = '4px'; g.fillText('CONTROL DE SEGURIDAD', 2, -42);
                g.font = `800 62px ${MONO}`; g.letterSpacing = '8px'; g.fillText('APROBADO', 4, 4);
                g.font = `600 17px ${MONO}`; g.letterSpacing = '4px'; g.fillText('PUERTA 12 · WA-2015', 2, 48);
                g.letterSpacing = '0px';
            }),
        });
        let stamps = null;

        function drawVisaPage() {
            const g = visa.g;
            paper(g);
            g.fillStyle = '#64748B';
            g.font = `500 26px ${MONO}`;
            spaced(g, 'VISADOS · OBSERVACIONES', 70, 100, 6);
            spaced(g, '03', CW - 70, 100, 6, 'right');
            g.strokeStyle = 'rgba(100,116,139,.3)';
            g.lineWidth = 2;
            g.beginPath(); g.moveTo(70, 126); g.lineTo(CW - 70, 126); g.stroke();

            g.textAlign = 'left';
            g.fillStyle = '#334155';
            g.font = `italic 400 49px ${SERIF}`;
            let y = wrapText(g, '“Desde 2015 trabajo en el lado menos glamoroso pero más crítico de la industria: las integraciones que aseguran la emisión de tarifas y la disponibilidad de vuelos.”', 70, 212, 884, 68);
            g.fillStyle = '#475569';
            g.font = `400 33px ${SANS}`;
            wrapText(g, 'Conectores EDIFACT y NDC, sincronización de PNR, motores de búsqueda de tarifas con caché distribuido y front-end para Sabre 360 y Amadeus.', 70, y + 84, 884, 48);

            stamps ??= buildStamps();
            printStamp(g, stamps.sabre, 205, 935, -.2);
            printStamp(g, stamps.amadeus, 615, 870, .12);
            printStamp(g, stamps.edifact, 860, 1060, .26);
            printStamp(g, stamps.iata, 285, 1195, -.08);
            if (approved) printStamp(g, stamps.approved, STAMP_AT.x, STAMP_AT.y, STAMP_AT.rot, .88);
            gutter(g, 'left', .26);
            visa.tex.needsUpdate = true;
        }

        // Portada: República de Codillera — cuero azul marino con estampado de pan de oro
        const PLANE_PATHS = [
            'M 80,150 Q 200,80 430,70 Q 450,75 440,90 Q 300,160 180,180 Z',
            'M 230,130 L 380,30 Q 400,32 370,55 L 260,140 Z',
            'M 220,155 L 340,240 Q 350,250 330,245 L 200,170 Z',
            'M 100,145 L 130,80 L 160,105 Z',
        ];
        // Tres versiones de la misma portada: color, mapa de metal (oro = metálico) y mapa de rugosidad
        const coverColor = makePage(), coverMetal = makePage(), coverRough = makePage(), coverBump = makePage();
        coverBump.tex.colorSpace = THREE.NoColorSpace;
        // Grano de cuero: miles de "poros" grises, suavizados. Sirve de textura y de relieve
        const leatherGrain = (() => {
            const c = document.createElement('canvas');
            c.width = CW;
            c.height = CH;
            const g = c.getContext('2d');
            g.fillStyle = '#808080';
            g.fillRect(0, 0, CW, CH);
            const rand = seeded(77);
            for (let i = 0; i < 70000; i++) {
                const v = 128 + (rand() - .5) * 80 | 0;
                g.fillStyle = `rgb(${v},${v},${v})`;
                g.beginPath();
                g.ellipse(rand() * CW, rand() * CH, 1.5 + rand() * 2.8, 1 + rand() * 2, rand() * Math.PI, 0, Math.PI * 2);
                g.fill();
            }
            const out = document.createElement('canvas');
            out.width = CW;
            out.height = CH;
            const og = out.getContext('2d');
            og.filter = 'blur(1px)';
            og.drawImage(c, 0, 0);
            return out;
        })();
        coverMetal.tex.colorSpace = THREE.NoColorSpace;
        coverRough.tex.colorSpace = THREE.NoColorSpace;

        function drawCoverInto(target, mode) {
            const g = target.g;
            const color = mode === 'color';
            g.save();
            g.shadowColor = 'transparent';
            const blindFrame = () => { g.beginPath(); g.roundRect(34, 34, CW - 68, CH - 68, 26); };
            if (color) {
                const bg = g.createLinearGradient(0, 0, CW, CH);
                bg.addColorStop(0, '#152e52');
                bg.addColorStop(1, '#0b1a33');
                g.fillStyle = bg;
                g.fillRect(0, 0, CW, CH);
                // Grano del cuero
                g.globalCompositeOperation = 'overlay';
                g.globalAlpha = .4;
                g.drawImage(leatherGrain, 0, 0);
                g.globalCompositeOperation = 'source-over';
                g.globalAlpha = 1;
                // Viñeta: bordes un poco más oscuros por el uso
                const vig = g.createRadialGradient(CW / 2, CH / 2, CH * .25, CW / 2, CH / 2, CH * .75);
                vig.addColorStop(0, 'rgba(0,0,0,0)');
                vig.addColorStop(1, 'rgba(0,0,0,.32)');
                g.fillStyle = vig;
                g.fillRect(0, 0, CW, CH);
                // Marco grabado en seco
                g.lineWidth = 4;
                g.strokeStyle = 'rgba(0,0,0,.4)';
                blindFrame(); g.stroke();
                g.save(); g.translate(0, 3);
                g.lineWidth = 2;
                g.strokeStyle = 'rgba(255,255,255,.07)';
                blindFrame(); g.stroke();
                g.restore();
            } else if (mode === 'bump') {
                g.drawImage(leatherGrain, 0, 0);
                g.lineWidth = 5;
                g.strokeStyle = '#4a4a4a';
                blindFrame(); g.stroke();
            } else {
                g.fillStyle = mode === 'metal' ? '#000' : '#f2f2f2';
                g.fillRect(0, 0, CW, CH);
            }

            // Pan de oro: degradado metálico + leve relieve
            let foil;
            if (color) {
                foil = g.createLinearGradient(0, 260, CW, 1150);
                foil.addColorStop(0, '#7A5A1F');
                foil.addColorStop(.22, '#D9B256');
                foil.addColorStop(.42, '#9C7428');
                foil.addColorStop(.6, '#E2BE62');
                foil.addColorStop(.8, '#8A6524');
                foil.addColorStop(1, '#C79E45');
                g.shadowColor = 'rgba(0,0,0,.45)';
                g.shadowOffsetY = 2;
                g.shadowBlur = 2;
            } else {
                foil = { metal: '#fff', rough: '#5c5c5c', bump: '#3c3c3c' }[mode];
            }
            g.fillStyle = foil;
            g.strokeStyle = foil;
            g.textBaseline = 'middle';
            const cx = CW / 2;

            // Nombre del país
            g.font = `500 30px ${MONO}`;
            spaced(g, 'REPÚBLICA DE', cx, 165, 14, 'center');
            g.font = `700 84px ${SERIF}`;
            spaced(g, 'VUELOS', cx, 240, 18, 'center');
            g.lineWidth = 3;
            g.beginPath(); g.moveTo(cx - 230, 300); g.lineTo(cx - 40, 300); g.moveTo(cx + 40, 300); g.lineTo(cx + 230, 300); g.stroke();
            g.beginPath(); g.arc(cx, 300, 7, 0, Math.PI * 2); g.fill();

            // ---- Emblema: globo terráqueo ----
            const GY = 625, R = 196;
            g.lineWidth = 22;
            g.lineCap = 'round';
            g.beginPath(); g.arc(cx, GY, R, 0, Math.PI * 2); g.stroke();
            g.save();
            g.beginPath(); g.arc(cx, GY, R - 4, 0, Math.PI * 2); g.clip();
            // Meridianos
            g.beginPath(); g.moveTo(cx, GY - R); g.lineTo(cx, GY + R); g.stroke();
            g.beginPath(); g.ellipse(cx, GY, R * .5, R, 0, 0, Math.PI * 2); g.stroke();
            // Ecuador y paralelos curvos
            g.beginPath(); g.moveTo(cx - R, GY); g.lineTo(cx + R, GY); g.stroke();
            g.beginPath(); g.moveTo(cx - R, GY - R * .62); g.quadraticCurveTo(cx, GY - R * .26, cx + R, GY - R * .62); g.stroke();
            g.beginPath(); g.moveTo(cx - R, GY + R * .62); g.quadraticCurveTo(cx, GY + R * .26, cx + R, GY + R * .62); g.stroke();
            g.restore();

            // Título del documento
            g.font = `700 82px ${SERIF}`;
            spaced(g, 'PASAPORTE', cx, 985, 16, 'center');
            g.font = `600 46px ${SERIF}`;
            spaced(g, 'MUNDIAL', cx, 1058, 22, 'center');
            g.font = `500 24px ${MONO}`;
            spaced(g, 'WORLD PASSPORT', cx, 1115, 10, 'center');

            // Símbolo al pie: sol de ocho rayos
            const SY = 1236;
            g.lineCap = 'butt';
            g.lineWidth = 9;
            g.beginPath(); g.arc(cx, SY, 27, 0, Math.PI * 2); g.stroke();
            for (let i = 0; i < 8; i++) {
                const a = i / 8 * Math.PI * 2;
                g.beginPath();
                g.moveTo(cx + Math.cos(a) * 33, SY + Math.sin(a) * 33);
                g.lineTo(cx + Math.cos(a) * 60, SY + Math.sin(a) * 60);
                g.stroke();
            }
            g.restore();
            target.tex.needsUpdate = true;
        }
        const drawCover = () => { drawCoverInto(coverColor, 'color'); drawCoverInto(coverMetal, 'metal'); drawCoverInto(coverRough, 'rough'); drawCoverInto(coverBump, 'bump'); };

        const drawAll = () => { stamps = null; drawCover(); drawDataPage(); drawVisaPage(); };
        drawAll();
        Promise.all([`500 26px ${MONO}`, `italic 400 49px ${SERIF}`, `700 84px ${SERIF}`, `600 46px ${SERIF}`, `700 25px ${SERIF}`, `700 90px ${HAND}`, `400 33px ${SANS}`]
            .map(f => document.fonts ? document.fonts.load(f) : Promise.resolve()))
            .then(drawAll).catch(() => {});
        loadMascot().then(img => { mascotImg = img; drawDataPage(); }).catch(() => {});

        // Reflejos para el pan de oro
        const pmrem = new THREE.PMREMGenerator(pr);
        scene.environment = pmrem.fromScene(new RoomEnvironment(pr), .04).texture;

        // ---------- Libreta ----------
        // Grosores: contratapa, bloque de páginas, hoja de datos, tapa
        const BACK_T = .026, PAGE_T = .075, LEAF_T = .016, COVER_T = .026;
        const CW3 = PW + .035, CH3 = PH + .05, CY3 = .008;   // tapas un poco más grandes que las hojas, con más borde arriba
        const navy = toonP(0x1d3a60);
        const edge = toonP(0xefe6d2);
        // Cantos del bloque con rayitas de hojas
        const stripes = vertical => {
            const c = document.createElement('canvas');
            c.width = c.height = 256;
            const g = c.getContext('2d');
            g.fillStyle = '#f1e8d4';
            g.fillRect(0, 0, 256, 256);
            g.fillStyle = 'rgba(120,100,70,.28)';
            for (let i = 0; i < 18; i++) {
                const p = 6 + i * 14 + (i % 3);
                vertical ? g.fillRect(p, 0, 2, 256) : g.fillRect(0, p, 256, 2);
            }
            const tex = new THREE.CanvasTexture(c);
            tex.colorSpace = THREE.SRGBColorSpace;
            return new THREE.MeshToonMaterial({ map: tex, gradientMap: tg });
        };
        const edgeSide = stripes(true), edgeTopBottom = stripes(false);

        const tilt = new THREE.Group();
        const book = new THREE.Group();
        tilt.add(book);
        scene.add(tilt);

        const back = withOutline(new THREE.Mesh(new RoundedBoxGeometry(CW3, CH3, BACK_T, 3, .011), navy));
        back.position.set(CW3 / 2, CY3, -BACK_T / 2);
        book.add(back);

        // Las hojas de papel van sin contorno; el lomo lo marca solo la sombra suave
        const pages = new THREE.Mesh(new RoundedBoxGeometry(PW, PH, PAGE_T, 2, .006),
            [edgeSide, edgeSide, edgeTopBottom, edgeTopBottom, new THREE.MeshBasicMaterial({ map: visa.tex }), edge]);
        pages.position.set(PW / 2, 0, PAGE_T / 2);
        book.add(pages);

        // Tapa con bisagra en el lomo: por fuera la portada (con oro metálico); por dentro, la hoja de datos
        const hinge = new THREE.Group();
        hinge.position.set(0, 0, PAGE_T + LEAF_T);
        book.add(hinge);
        const coverFace = new THREE.MeshStandardMaterial({
            map: coverColor.tex, metalnessMap: coverMetal.tex, roughnessMap: coverRough.tex,
            bumpMap: coverBump.tex, bumpScale: 2.2,
            metalness: 1, roughness: 1, envMapIntensity: .9,
        });
        const cover = withOutline(new THREE.Mesh(new RoundedBoxGeometry(CW3, CH3, COVER_T, 3, .011),
            [navy, navy, navy, navy, coverFace, navy]));
        cover.position.set(CW3 / 2, CY3, COVER_T / 2);
        hinge.add(cover);
        const leaf = new THREE.Mesh(new RoundedBoxGeometry(PW, PH, LEAF_T, 2, .005),
            [edge, edge, edge, edge, edge, new THREE.MeshBasicMaterial({ map: data.tex })]);
        // La hoja de datos monta apenas sobre el lomo para que el pliegue se vea como una sola unión
        leaf.position.set(PW / 2 - .014, 0, -LEAF_T / 2);
        hinge.add(leaf);

        // Sello de goma
        const stamp = new THREE.Group();
        stamp.add(withOutline(new THREE.Mesh(new THREE.CylinderGeometry(.05, .065, .2, 24).rotateX(Math.PI / 2).translate(0, 0, .16), toonP(0xb7793f))));
        stamp.add(withOutline(new THREE.Mesh(new THREE.SphereGeometry(.075, 20, 14).translate(0, 0, .28), toonP(0xc98a4b))));
        stamp.add(withOutline(new THREE.Mesh(new THREE.BoxGeometry(.4, .15, .05).translate(0, 0, .04), toonP(0x334155))));
        stamp.add(new THREE.Mesh(new THREE.BoxGeometry(.38, .13, .016).translate(0, 0, .008), toonP(0xdc2626)));
        stamp.rotation.z = -STAMP_AT.rot;
        stamp.visible = false;
        book.add(stamp);
        const STX = STAMP_AT.x / CW * PW, STY = PH / 2 - STAMP_AT.y / CH * PH;

        // ---------- Interacción ----------
        const pCanvas = $('#passportCanvas');
        const st = { open: 0, openTarget: 0, focus: -1, camX: 0, rx: 0, ry: 0, tx: 0, ty: 0, visible: false, single: false, stampT: -1, cw: 0, ch: 0, autoOpened: false };
        box.addEventListener('pointermove', e => {
            const r = box.getBoundingClientRect();
            st.ty = ((e.clientX - r.left) / r.width - .5) * .1;
            st.tx = ((e.clientY - r.top) / r.height - .5) * .05;
        });
        box.addEventListener('pointerleave', () => { st.tx = st.ty = 0; });
        // Escritorio: clic abre / cierra para volver a ver la portada. Móvil: tocar cambia de página
        box.addEventListener('click', () => {
            st.autoOpened = true;
            if (st.single && st.openTarget === 1) { st.focus *= -1; return; }
            st.openTarget = st.openTarget ? 0 : 1;
            // Si se cierra con el sello en camino, se cancela; si aún no estampó, volverá a caer al reabrir
            if (st.openTarget === 0 && st.stampT >= 0) {
                st.stampT = -1;
                stamp.visible = false;
            }
        });
        new IntersectionObserver(([entry]) => { st.visible = entry.isIntersecting; }, { threshold: 0 }).observe(pCanvas);

        // Shaders compilados en paralelo antes del primer frame (sin trabar el scroll)
        let compiled = false, shown = false;
        shadersReady(pr, scene, cam).then(() => { compiled = true; });
        renderPassport = t => {
            if (!st.visible || !compiled) return;
            // El lienzo es más grande que la caja para que la tapa no se corte al levantarse
            const cw = pCanvas.clientWidth, ch = pCanvas.clientHeight;
            if (cw !== st.cw || ch !== st.ch) {
                st.cw = cw;
                st.ch = ch;
                pr.setPixelRatio(Math.min(devicePixelRatio, 2));
                pr.setSize(cw, ch, false);
                cam.aspect = cw / ch;
                cam.updateProjectionMatrix();
            }
            const w = box.clientWidth, h = box.clientHeight;
            st.single = w / h < 1.1;

            // Se abre solo cuando el pasaporte ya está bien a la vista (centro por encima del 55% de la pantalla)
            if (!st.autoOpened) {
                const r = box.getBoundingClientRect();
                if (r.top + r.height * .5 < innerHeight * .55) {
                    st.autoOpened = true;
                    setTimeout(() => { st.openTarget = 1; }, 300);
                }
            }

            // Apertura de la tapa (más pausada) y desplazamiento para centrar la libreta
            st.open += (st.openTarget - st.open) * (reduceMotion ? 1 : .044);
            const o = ease(clamp(st.open, 0, 1));
            hinge.rotation.y = -(Math.PI - .05) * o;
            book.position.x = lerp(-CW3 / 2, 0, o);

            // Inclinación base + mouse
            st.rx += (st.tx - st.rx) * .08;
            st.ry += (st.ty - st.ry) * .08;
            tilt.rotation.set(lerp(-.26, .05, o) + st.rx, lerp(-.38, 0, o) + st.ry, lerp(-.05, -.01, o));

            // Sello: cuando está abierto (en móvil, al mirar la página de visados)
            if (!approved && st.stampT < 0 && st.open > .97 && (!st.single || st.focus === 1)) {
                if (reduceMotion) { approved = true; drawVisaPage(); }
                else st.stampT = t;
            }
            if (st.stampT >= 0) {
                // Tiempos (s): espera · baja y se detiene encima · golpe · presiona · se retira
                const k = (t - st.stampT) / 1000 - .4;
                const T_HOVER = .88, T_HIT = 1.08, T_HOLD = 1.6, T_END = 2.56;
                let z = 1.2, ox = 0, oy = .45, squash = 1, tiltS = 0;
                if (k < 0) {
                    stamp.visible = false;
                } else {
                    stamp.visible = k < T_END;
                    if (k < T_HOVER) {
                        // Entra despacio y queda flotando sobre la página
                        const e = ease(k / T_HOVER);
                        z = lerp(1.2, PAGE_T + .27, e);
                        oy = lerp(.45, 0, e);
                        tiltS = lerp(.25, 0, e);
                    } else if (k < T_HIT) {
                        // Golpe rápido
                        const e = (k - T_HOVER) / (T_HIT - T_HOVER);
                        z = lerp(PAGE_T + .27, PAGE_T, e * e);
                        oy = 0;
                    } else if (k < T_HOLD) {
                        if (!approved) { approved = true; drawVisaPage(); }
                        z = PAGE_T;
                        oy = 0;
                        squash = .82 + Math.min(1, (k - T_HIT) / .12) * .06;
                    } else {
                        // Se levanta y sale
                        const e = ease(clamp((k - T_HOLD) / (T_END - T_HOLD), 0, 1));
                        z = lerp(PAGE_T, 1.4, e);
                        ox = lerp(0, .45, e);
                        oy = lerp(0, .7, e);
                        tiltS = lerp(0, -.2, e);
                    }
                }
                stamp.position.set(STX + ox, STY + oy, z);
                stamp.rotation.x = tiltS;
                stamp.scale.set(1, 1, squash);
                if (k >= T_END) st.stampT = -1;
            }

            // Cámara: encuadra la libreta dentro de la caja (el lienzo sobra alrededor)
            const tanH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
            const needW = st.single ? 1.1 : 2.22, needH = st.single ? 1.45 : 1.58;
            const d = ch / (2 * tanH) * Math.max(needH / h, needW / w);
            const targetX = st.single && st.open > .5 ? st.focus * .5 : 0;
            st.camX += (targetX - st.camX) * .08;
            cam.position.set(st.camX, -.05, d);
            cam.lookAt(st.camX, -.03, 0);

            pr.render(scene, cam);
            if (!shown) {
                shown = true;
                box.classList.add('is-ready');
            }
        };
    })();
    return renderPassport;
}
