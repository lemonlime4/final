import { options } from './options.js';

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas'),
});
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const shader = new ShaderPass({
    name: 'Post processing shader',
    uniforms: {
        tDiffuse: { value: null },
        threshold: { value: new THREE.TextureLoader().load('../assets/bluenoise.png') },
    },
    vertexShader: `varying vec2 UV;void main(){UV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1);}`,
    fragmentShader: await (await fetch('./scripts/postprocessing.frag')).text()
});
composer.addPass(shader);
composer.addPass(new OutputPass());

{
    function onResize() {
        renderer.setPixelRatio(options.pixelRatio);
        composer.setPixelRatio(options.pixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight, true);
        composer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    onResize();
    window.addEventListener('resize', onResize);
}




import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const map = await new Promise(resolve => new GLTFLoader().load(
    '../assets/scene.glb',
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



requestAnimationFrame(function tick() {
    composer.render();
    requestAnimationFrame(tick);
});














import Stats from 'three/addons/libs/stats.module.js';
{
    const stats = new Stats();
    document.body.appendChild(stats.domElement);
    (function updateStats() {
        stats.update();
        requestAnimationFrame(updateStats);
    })()
}
