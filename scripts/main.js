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
const postShader = new ShaderPass({
    name: 'Post processing shader',
    uniforms: {
        tDiffuse: { value: null },
        threshold: { value: new THREE.TextureLoader().load('../assets/bluenoise.png') },
    },
    vertexShader: `varying vec2 UV;void main(){UV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1);}`,
    fragmentShader: await (await fetch('./scripts/postprocessing.frag')).text()
});
composer.addPass(postShader);
composer.addPass(new OutputPass());



// handling window resize

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





// gltf loader

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader().setPath('../assets/models/');


// add map

const map = await new Promise(resolve => loader.load(
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
    ...await new Promise(resolve => loader.load(
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




// ad hoc code
window.p = player;
camera.position.set(10, 5, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0));
window.addEventListener('click', e => {
    const raycaster = new THREE.Raycaster();
    const mousePos = new THREE.Vector2(
        -1 + 2 * e.clientX / window.innerWidth,
        +1 - 2 * e.clientY / window.innerHeight
    );
    raycaster.setFromCamera(mousePos, camera);
    const intersects = raycaster.intersectObject(map);
    console.log(intersects);
    if (intersects.length === 0) return;
    const point = intersects[0].point;
    player.moveTo(point);
})



// game loop

requestAnimationFrame(function tick() {
    const dt = options.dt;

    player.update(dt);

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
