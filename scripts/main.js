import { options } from './options.js';

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(options.fov, 1, 0.01, 100);

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





// mouse.position inputs
const mouse = {
    position: new THREE.Vector2(),
    movement: new THREE.Vector2(),
};

import { GameContext } from './contexts/game.js';
const context = new GameContext({ camera, mouse });

window.addEventListener('mousemove', event => {
    mouse.position.set(event.clientX, event.clientY);
    mouse.movement.set(event.movementX, event.movementY);
    context.handleMousemove(event);
});

window.addEventListener('mousedown', event => {
    context.handleMousedown(event);
})

window.addEventListener('keydown', event => {
    context.handleKeydown(event);
})

window.addEventListener('keyup', event => {
    context.handleKeyup(event);
})

// window.addEventListener('blur', event => {
// context.handleBlur(event);
// })






// handling window resize
// resize renderer, set camera aspect ratio, clamp mouse.position
{
    function onResize() {
        renderer.setPixelRatio(options.pixelRatio);
        composer.setPixelRatio(options.pixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight, true);
        composer.setSize(window.innerWidth, window.innerHeight);
        renderer.getSize(postShader.uniforms.resolution.value);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        mouse.position.clamp(
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
        for (const obj of gltf.scene.children) {
            obj.material.side = THREE.FrontSide;
        }
        console.log(gltf.scene);
        resolve(gltf.scene);
    }
));
scene.add(map);

import { lights } from './scene.js';
for (const light of lights) {
    scene.add(light);
    // scene.add(new THREE.PointLightHelper(light));
};





// player

import { player } from './player.js';
scene.add(player.model);











let lastTimestamp = 0;
requestAnimationFrame(function tick(timestamp) {
    const dt = Math.min(timestamp - lastTimestamp, options.maxDt) / 1000;
    lastTimestamp = timestamp;

    // camera.position.x += .1;
    context.update(dt);
    composer.render();
    requestAnimationFrame(tick);
});







// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// const oc = new OrbitControls(camera, renderer.domElement);

// camera.position.set(0, 10, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));

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