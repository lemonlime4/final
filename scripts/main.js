import { options } from './options.js';

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';



THREE.ColorManagement.enabled = true;


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
        threshold: {
            value: textureLoader.load(options.ditherThresholdMap)
        },
        wasdIcon: {
            value: textureLoader.load('bayer.png')
        },
        mouseIcon: {
            value: textureLoader.load('bayer.png')
        },

        overlay: { value: null },
        resolution: { value: new THREE.Vector2() },
        controlIconState: { value: 2 },


        alarmed: { value: false },
    },
    vertexShader: `varying vec2 UV;void main(){UV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1);}`,
    fragmentShader: await (await fetch('./scripts/postprocessing.frag')).text()
});
composer.addPass(postShader);
composer.addPass(new OutputPass());

// postShader.uniforms.controlIconState.value = 1;



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
    states: {
        normal: 0,
        interaction: 1,
    },
    state: 0,
};
















// add map

import { map, lights } from './scene.js';

scene.add(map);

for (const light of lights) {
    scene.add(light);
    // scene.add(new THREE.PointLightHelper(light));
};





// player

import { player } from './player.js';
scene.add(player.model);





import { MenuContext } from './contexts/menu.js';
import { GameContext } from './contexts/game.js';
const contextData = { postShader, camera, mouse, overlay };
let context = new GameContext(contextData);





window.addEventListener('mousemove', event => {
    mouse.position.set(event.clientX, event.clientY)
        .multiplyScalar(options.pixelRatio);
    context.handleMousemove(event);
});

import { audio } from './audio.js';
window.addEventListener('mousedown', event => {
    context.handleMousedown(event);
    audio.click.cloneNode().play();
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

    if (context.transitionToGameContext)
        context = new GameContext(contextData);
    if (context.transitionToMenuContext)
        context = new MenuContext(contextData);

    context.update(dt);
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