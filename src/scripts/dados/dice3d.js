// Modelo 3D de un dado (geometría, texturas y material) compartido por la mesa y las miniaturas
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { FACE_VALUES } from './physics.js';
import { LOOKS, paintFace } from './faces.js';

// Texturas de cada cara (color y relieve), compartidas por los dados con el mismo aspecto
const faceCache = new Map();
function faceTextures(lookId, value) {
    const key = `${lookId}:${value}`;
    if (!faceCache.has(key)) {
        const color = new THREE.CanvasTexture(paintFace(lookId, value, 512));
        color.colorSpace = THREE.SRGBColorSpace;
        const bump = new THREE.CanvasTexture(paintFace(lookId, value, 256, 'bump'));
        // three lo limita a lo que soporte la GPU
        for (const t of [color, bump]) t.anisotropy = 8;
        faceCache.set(key, { color, bump });
    }
    return faceCache.get(key);
}

// Canto redondeado según el aspecto (los de nácar y el celestial son casi bolas)
const geos = new Map();
const geoFor = r => {
    if (!geos.has(r)) geos.set(r, new RoundedBoxGeometry(1, 1, 1, 5, r));
    return geos.get(r);
};

// Un material por cara, en el orden de la caja de three (FACE_VALUES)
export function makeDieMesh() {
    const mats = FACE_VALUES.map(() => new THREE.MeshPhysicalMaterial({ envMapIntensity: .7, emissive: '#000', bumpScale: 1.6 }));
    return new THREE.Mesh(geoFor(.14), mats);
}

export function applyLook(mesh, lookId) {
    const look = LOOKS[lookId];
    mesh.geometry = geoFor(look.radius || .14);
    mesh.material.forEach((m, k) => {
        const tex = faceTextures(lookId, FACE_VALUES[k]);
        m.map = tex.color;
        m.bumpMap = tex.bump;
        m.roughness = look.rough;
        m.metalness = look.metal || 0;
        m.iridescence = look.iridescence || 0;
        m.iridescenceIOR = 1.6;
        m.clearcoat = look.iridescence ? .6 : 0;
        m.needsUpdate = true;
    });
}
