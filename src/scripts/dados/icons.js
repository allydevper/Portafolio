// Miniaturas de los dados para el selector y el marcador: el mismo modelo 3D de la mesa,
// dibujado una vez por aspecto en un lienzo aparte y guardado como imagen
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeDieMesh, applyLook } from './dice3d.js';
import { paintFace } from './faces.js';

const SIZE = 160;
let studio;

function setup() {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas: document.createElement('canvas'), alpha: true, antialias: true, preserveDrawingBuffer: true });
    } catch (err) {
        return null;
    }
    renderer.setSize(SIZE, SIZE, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(renderer), .04).texture;
    scene.add(new THREE.HemisphereLight('#ffe6c4', '#3a2412', .6));
    const key = new THREE.DirectionalLight('#fff1dc', 2.4);
    key.position.set(-2, 5, 3);
    scene.add(key);
    // Vista isométrica: el 1 arriba, como los iconos del juego
    const camera = new THREE.OrthographicCamera(-.84, .84, .84, -.84, .1, 20);
    camera.position.set(3, 3.3, 3);
    camera.lookAt(0, 0, 0);
    const mesh = makeDieMesh();
    mesh.rotation.z = Math.PI / 2;
    scene.add(mesh);
    return { renderer, scene, camera, mesh };
}

const urls = new Map();
function iconUrl(lookId) {
    if (urls.has(lookId)) return urls.get(lookId);
    if (studio === undefined) studio = setup();
    let url;
    if (studio) {
        applyLook(studio.mesh, lookId);
        studio.renderer.render(studio.scene, studio.camera);
        url = studio.renderer.domElement.toDataURL();
    } else {
        // Sin WebGL: la cara del 5 plana
        url = paintFace(lookId, 5, 96).toDataURL();
    }
    urls.set(lookId, url);
    return url;
}

export function dieIcon(die) {
    const img = new Image(SIZE, SIZE);
    img.className = 'die-icon';
    img.alt = die.name;
    img.title = die.name;
    img.src = iconUrl(die.look);
    return img;
}
