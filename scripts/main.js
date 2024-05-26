import { options } from './options.js';

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';





// scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(options.fov, 1, 0.01, 100);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#renderOutput'),
});
document.body.appendChild(renderer.domElement);



// load fonts
{
    const bebasNeue = new FontFace(
        'Bebas Neue',
        'url(../assets/fonts/bebasNeue.woff2)',
        {}
    );
    const dogicaPixel = new FontFace(
        'Dogica Pixel',
        'url(../assets/fonts/dogicaPixel.woff2)',
        {}
    );
    const dogicaPixelBold = new FontFace(
        'Dogica Pixel',
        'url(../assets/fonts/dogicaPixelBold.woff2)',
        {
            weight: 'bold',
        }
    );
    document.fonts.add(bebasNeue);
    document.fonts.add(dogicaPixel);
    document.fonts.add(dogicaPixelBold);
    await Promise.all([
        bebasNeue.load(),
        dogicaPixel.load(),
        dogicaPixelBold.load()
    ]);
}



// post processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const textureLoader = new THREE.TextureLoader()
    .setPath('../assets/textures/');
const postShader = new ShaderPass({
    name: 'Post processing shader',
    uniforms: {
        tDiffuse: { value: null },
        overlay: { value: null },
        threshold: {
            value: textureLoader.load(options.ditherThresholdMap)
        },
        normalCursor: {
            value: textureLoader.load('bayer.png')
        },

        resolution: { value: new THREE.Vector2() },
        mousePosition: { value: new THREE.Vector2() },
        mouseState: { value: 1 },
    },
    vertexShader: `varying vec2 UV;void main(){UV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1);}`,
    fragmentShader: await (await fetch('./scripts/postprocessing.frag')).text()
});
composer.addPass(postShader);
composer.addPass(new OutputPass());





// overlay canvas
const overlay = {
    canvas: document.querySelector('#overlay'),
    ctx: document.querySelector('#overlay').getContext('2d'),
    updateUniforms() {
        postShader.uniforms.overlay.value = new THREE.CanvasTexture(this.canvas);
    }
};



// mouse.position inputs
const mouse = {
    position: new THREE.Vector2(),
    updateUniforms() {
        postShader.uniforms.mousePosition.value.set(
            this.position.x,
            overlay.canvas.height - this.position.y
        );
    }
};
















// add map

const map = await new Promise(resolve => new GLTFLoader().load(
    '../assets/models/scene.glb',
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




import { MenuContext } from './contexts/menu.js';
import { GameContext } from './contexts/game.js';
const contextData = { camera, mouse, map, overlay };
let context = new MenuContext(contextData);

window.addEventListener('mousemove', event => {
    mouse.position.set(event.clientX, event.clientY)
        .multiplyScalar(options.pixelRatio);
    mouse.updateUniforms();
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

// handling window resize
{
    function onResize() {
        renderer.setPixelRatio(options.pixelRatio);
        composer.setPixelRatio(options.pixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight, true);
        composer.setSize(window.innerWidth, window.innerHeight);
        const size = renderer.getDrawingBufferSize(new THREE.Vector2());
        postShader.uniforms.resolution.value.copy(size);
        overlay.canvas.width = size.width;
        overlay.canvas.height = size.height;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        mouse.position.clamp(
            new THREE.Vector2(0, 0),
            new THREE.Vector2(window.innerWidth, window.innerHeight)
        );
        mouse.updateUniforms();
        context.handleResize();
    }
    onResize();
    window.addEventListener('resize', onResize);
}

// window.addEventListener('blur', event => {
// context.handleBlur(event);
// })






let lastTimestamp = 0;
requestAnimationFrame(function tick(timestamp) {
    const dt = Math.min(timestamp - lastTimestamp, options.maxDt) / 1000;
    lastTimestamp = timestamp;

    context.update(dt);
    composer.render();

    requestAnimationFrame(tick);
});







import { walkInteractions } from './scene.js';
for (const x of walkInteractions) {
    scene.add(new THREE.Box3Helper(x.box));
}



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