import { options } from './options.js';

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
camera.near = 0.01;
camera.far = 1000;

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas'),
});
document.body.appendChild(renderer.domElement);



// post processing

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const textureLoader = new THREE.TextureLoader()
    .setPath('../assets/textures/');
const postShader = new ShaderPass({
    name: 'Post processing shader',
    uniforms: {
        tDiffuse: { value: null },
        threshold: { value: textureLoader.load('bluenoise.png') },
        resolution: { value: new THREE.Vector2() },
    },
    vertexShader: `varying vec2 UV;void main(){UV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1);}`,
    fragmentShader: await (await fetch('./scripts/postprocessing.frag')).text()
});
composer.addPass(postShader);
composer.addPass(new OutputPass());





// mouse inputs
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', event => {
    mouse.set(event.clientX, event.clientY);
});






// handling window resize
// resize renderer, set camera aspect ratio, clamp mouse
{
    function onResize() {
        renderer.setPixelRatio(options.pixelRatio);
        composer.setPixelRatio(options.pixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight, true);
        composer.setSize(window.innerWidth, window.innerHeight);
        renderer.getSize(postShader.uniforms.resolution.value);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        mouse.clamp(
            new THREE.Vector2(0, 0),
            new THREE.Vector2(window.innerWidth, window.innerHeight)
        );
    }
    onResize();
    window.addEventListener('resize', onResize);
}






import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader().setPath('../assets/models/');


// add map

const map = await new Promise(resolve => gltfLoader.load(
    'scene.glb',
    gltf => {
        for (const mesh of gltf.scene.children) {
            mesh.material = new THREE.MeshStandardMaterial({
                roughness: 1,
                color: 0xffffff,
            })
        }
        resolve(gltf.scene);
    }
));
scene.add(map);

{
    const light = new THREE.RectAreaLight(
        0xffffff,
        3,
        5, 3
    );
    light.position.set(0, 6, 0);
    light.lookAt(0, 0, 0);
    scene.add(light);
}






// player

const player = {
    path: null,
    turn: null,
    ...await new Promise(resolve => gltfLoader.load(
        'player.glb',
        gltf => {
            const model = gltf.scene;
            const mixer = new THREE.AnimationMixer(model);
            const walkAction = mixer.clipAction(
                THREE.AnimationClip
                    .findByName(gltf.animations, 'Walk')
            );
            const idleAction = mixer.clipAction(
                THREE.AnimationClip
                    .findByName(gltf.animations, 'Idle')
            );

            scene.add(model);
            walkAction.setEffectiveWeight(0);
            idleAction.setEffectiveWeight(1);
            walkAction.play();
            idleAction.play();
            resolve({
                model, mixer, walkAction, idleAction
            });
        }
    )),

    moveTo(point) {
        // start walk animation
        if (!this.path) {
            this.walkAction.enabled = true;
            this.walkAction.setEffectiveWeight(1);
            this.idleAction.crossFadeTo(this.walkAction, .5, true);
        }
        // set movement path and turning
        const dir = point.clone().sub(this.model.position);
        this.path = {
            start: this.model.position.clone(),
            end: point.clone(),
            length: dir.length(),
            completion: 0
        };
        this.turn = {
            start: this.model.quaternion.clone(),
            end: new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 0, 1),
                dir.set(dir.x, 0, dir.z).normalize()
            ),
            completion: 0
        };
    },

    update(dt) {
        // for animation
        this.mixer.update(dt);

        // turn player
        if (this.turn) {
            this.turn.completion += options.turnSpeed * dt;
            this.model.quaternion
                .copy(this.turn.start)
                .slerp(this.turn.end, this.turn.completion);
            if (this.turn.completion > 1) {
                this.turn = null;
            }
        }

        // move player
        if (this.path) {
            this.path.completion += dt * options.walkSpeed / this.path.length;
            this.model.position.copy(
                this.path.start.clone().lerp(
                    this.path.end,
                    this.path.completion
                )
            );
            if (this.path.completion > 1) {
                this.path = null;

                // fade animation to idle
                this.idleAction.enabled = true;
                this.idleAction.setEffectiveWeight(1);
                this.walkAction.crossFadeTo(this.idleAction, .3, true);
            }
        }
    },
};


// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// const c = new OrbitControls(camera, renderer.domElement);


const raycaster = new THREE.Raycaster();
const intersectables = [map];
window.addEventListener('click', event => {
    const screenspaceMouse = new THREE.Vector2(
        -1 + 2 * mouse.x / window.innerWidth,
        +1 - 2 * mouse.y / window.innerHeight
    );
    raycaster.setFromCamera(screenspaceMouse, camera);
    const intersects = raycaster.intersectObjects(intersectables);
    if (intersects.length === 0) return;
    const point = intersects[0].point;
    player.moveTo(point);
});





import { fixedCameraZones } from './scene.js';
scene.add(new THREE.AmbientLight(0x202020))
const lights = [
    new THREE.RectAreaLight()
];
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
for (const light of lights) scene.add(new RectAreaLightHelper(light))

const controls = {
    activeZone: null,
    zones: [
        ...fixedCameraZones,
        {
            isFirstPerson: true,
            bounds: new THREE.Box3(
                new THREE.Vector3(2, -1, 2),
                new THREE.Vector3(6, -1, 5)
            ),
        }
    ],
    update() {
        if (this.activeZone?.isFirstPerson) {
        }
        const playerPos = player.model.position;
        if (this.activeZone?.bounds.containsPoint(playerPos))
            return;
        const zone = this.zones.find(zone => zone.bounds.containsPoint(playerPos));
        if (!zone) return;
        camera.position.copy(zone.camera.from);
        camera.lookAt(zone.camera.to);
        this.activeZone = zone;
    }
}
for (const zone of controls.zones) {
    scene.add(new THREE.Box3Helper(zone.bounds));
}







// game loop

requestAnimationFrame(function tick() {
    const dt = options.dt;

    player.update(dt);
    controls.update();

    composer.render();
    requestAnimationFrame(tick);
});












// stats

import Stats from 'three/addons/libs/stats.module.js';
{
    const stats = new Stats();
    document.body.appendChild(stats.domElement);
    (function updateStats() {
        stats.update();
        requestAnimationFrame(updateStats);
    })()
}

const axes = new THREE.AxesHelper();
axes.position.y = 1;
scene.add(axes);


// for (const object of scene.children) {
// 	scene.remove(object);
// }
// import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
// const l0 = new DRACOLoader();
// l0.setDecoderPath('https://unpkg.com/three@0.164.1/examples/jsm/libs/draco/')
// scene.add(await new Promise(res => new GLTFLoader().setDRACOLoader(l0).load('LittlestTokyo.glb', gltf => {
// 	gltf.scene.scale.set(.05, .05, .05)
// 	res(gltf.scene);
// })))
// scene.add(new THREE.HemisphereLight(0xffffff));
// camera.position.set(21.5, 1, 10.1);
// camera.quaternion.set(-0.07064461439650073, 0.5583248786086188, 0.04779616577236755, 0.8252261477443024)