// Física de la tirada con cannon-es. La tirada se simula entera sin dibujar y se graba:
// así se sabe qué cara quedó arriba antes de mostrarla y la escena puede ajustar el dado al valor sorteado
import * as CANNON from 'cannon-es';

// Interior del tablero (unidades = lado del dado)
export const TRAY = { w: 12, d: 8 };
const STEP = 1 / 60;
const MAX_STEPS = 60 * 7;

// Cara de cada valor en la caja de three (+x, -x, +y, -y, +z, -z): los opuestos suman 7
export const FACE_VALUES = [1, 6, 2, 5, 3, 4];
const NORMALS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
export const normalOf = v => NORMALS[FACE_VALUES.indexOf(v)];

const boxShape = new CANNON.Box(new CANNON.Vec3(.5, .5, .5));
const tableMat = new CANNON.Material('table'), diceMat = new CANNON.Material('dice');

function makeWorld() {
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -32, 0), allowSleep: true });
    world.addContactMaterial(new CANNON.ContactMaterial(tableMat, diceMat, { friction: .35, restitution: .35 }));
    world.addContactMaterial(new CANNON.ContactMaterial(diceMat, diceMat, { friction: .15, restitution: .45 }));
    const floor = new CANNON.Body({ mass: 0, material: tableMat, shape: new CANNON.Plane() });
    floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(floor);
    // Bordes del tablero (altos e invisibles por arriba para que ningún dado salte fuera)
    const H = 6, T = 1, { w, d } = TRAY;
    for (const [x, z, hx, hz] of [[0, -d / 2 - T / 2, w / 2 + T, T / 2], [0, d / 2 + T / 2, w / 2 + T, T / 2], [-w / 2 - T / 2, 0, T / 2, d / 2], [w / 2 + T / 2, 0, T / 2, d / 2]]) {
        const wall = new CANNON.Body({ mass: 0, material: tableMat, shape: new CANNON.Box(new CANNON.Vec3(hx, H / 2, hz)) });
        wall.position.set(x, H / 2, z);
        world.addBody(wall);
    }
    return world;
}

// Cara que mira hacia arriba y cuánto (1 = plano)
function upFace(q) {
    let best = 0, dot = -2;
    const v = new CANNON.Vec3();
    NORMALS.forEach(([x, y, z], i) => {
        q.vmult(new CANNON.Vec3(x, y, z), v);
        if (v.y > dot) { dot = v.y; best = i; }
    });
    return { value: FACE_VALUES[best], flat: dot };
}

function simulateOnce(count, from, rand) {
    const world = makeWorld();
    const bodies = [];
    // Salen desde el borde de quien tira (from: 1 = jugador, abajo; -1 = rival, arriba), en una grilla para no encimarse
    for (let i = 0; i < count; i++) {
        const b = new CANNON.Body({ mass: 1, material: diceMat, shape: boxShape, linearDamping: .08, angularDamping: .08 });
        b.sleepSpeedLimit = .18;
        b.sleepTimeLimit = .25;
        const col = i % 3, row = Math.floor(i / 3);
        b.position.set((col - 1) * 1.35 + (rand() - .5) * .4, 1.2 + row * 1.3, from * (TRAY.d / 2 - .9));
        b.quaternion.setFromEuler(rand() * 6.3, rand() * 6.3, rand() * 6.3);
        b.velocity.set((rand() - .5) * 7, 2 + rand() * 3, -from * (11 + rand() * 6));
        b.angularVelocity.set((rand() - .5) * 30, (rand() - .5) * 30, (rand() - .5) * 30);
        world.addBody(b);
        bodies.push(b);
    }
    // Choques para el sonido: paso y fuerza
    const hits = [];
    let step = 0;
    bodies.forEach(b => b.addEventListener('collide', e => {
        const v = Math.abs(e.contact.getImpactVelocityAlongNormal());
        if (v > 1.5) hits.push({ step, v });
    }));
    const frames = bodies.map(() => []);
    const record = () => bodies.forEach((b, i) => frames[i].push(b.position.x, b.position.y, b.position.z, b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w));
    record();
    for (step = 1; step <= MAX_STEPS; step++) {
        world.step(STEP);
        record();
        if (bodies.every(b => b.sleepState === CANNON.Body.SLEEPING)) break;
    }
    const ups = bodies.map(b => upFace(b.quaternion));
    const ok = bodies.every(b => b.sleepState === CANNON.Body.SLEEPING) && ups.every(u => u.flat > .985);
    return { frames: frames.map(f => new Float32Array(f)), steps: frames[0].length / 7, up: ups.map(u => u.value), hits, ok };
}

// Graba una tirada de count dados; repite si alguno queda montado o no se detiene
export function simulateThrow(count, from, rand = Math.random) {
    let sim;
    for (let i = 0; i < 10; i++) {
        sim = simulateOnce(count, from, rand);
        if (sim.ok) break;
    }
    return { ...sim, dt: STEP };
}
