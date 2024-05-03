import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Timer } from 'three/addons/misc/Timer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Stats from 'three/addons/libs/stats.module.js';

import { game } from './game.js';

const stats = new Stats();
document.body.appendChild(stats.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('canvas'),
});
document.body.appendChild(renderer.domElement);


const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new OutputPass());

const pixelRatio = .5;
function onResize() {
	renderer.setPixelRatio(pixelRatio);
	composer.setPixelRatio(pixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight, false);
	composer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
}
onResize();
window.addEventListener('resize', onResize);




camera.position.set(0, 20, 0);
camera.lookAt(new THREE.Vector3());
camera.updateProjectionMatrix();

// const map = new THREE.Mesh(
// 	new THREE.BoxGeometry(8, 2, 6),
// 	new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.BackSide })
// );
// scene.add(map);

const map = await new Promise(resolve => new GLTFLoader().load(
	'../../assets/scene.glb',
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



const player = {
	model: await new Promise(resolve => new GLTFLoader().load(
		'../../assets/frog.glb',
		gltf => {
			console.log(gltf);
			gltf.scene.position.set(0, 0, 1);
			gltf.scene.scale.set(1.5, 1.5, 1.5)
			scene.add(gltf.scene);
			resolve(gltf.scene);
		}
	)),
	path: null,
	walkSpeed: 1,
	newOrientation: null,
	turnSpeed: 10,
	moveTo(point) {
		const dir = point.clone().sub(this.model.position);
		this.path = {
			dir: dir.clone().normalize(),
			start: this.model.position.clone(),
			length: dir.length(),
			completion: 0,
		};
		dir.set(dir.x, 0, dir.z).normalize();
		this.newOrientation = new THREE.Quaternion()
			.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
	},

	update(dt) {
		dt = 1 / 40;

		// turn player
		if (this.newOrientation) {
			this.model.quaternion.rotateTowards(
				this.newOrientation,
				this.turnSpeed * dt
			);
			if (this.model.quaternion.equals(this.newOrientation)) {
				this.newOrientation = null;
			}
			return;
		}
		// move player
		if (this.path) {
			this.path.completion += dt * this.walkSpeed;
			this.model.position.copy(
				this.path.start.clone().addScaledVector(
					this.path.dir,
					this.path.completion
				)
			);
			if (this.path.completion > this.path.length) {
				this.path = null;
			}
		}
	}
};
window.p = player;
window.V = THREE.Vector3;

const pointer = new THREE.Vector2();
window.addEventListener('pointermove', event => {
	pointer.set(
		-1 + 2 * event.clientX / window.innerWidth,
		1 - 2 * event.clientY / window.innerHeight
	);
})


const clickable = map;
const raycaster = new THREE.Raycaster();
window.addEventListener('pointerdown', () => {
	raycaster.setFromCamera(pointer, camera);
	const intersects = raycaster.intersectObject(clickable);
	if (intersects.length === 0) {
		return;
	};
	const point = intersects[0].point;
	// ball.position.copy(point);
	// ball.visible = true;
	player.moveTo(point);
})

function animate() {
	requestAnimationFrame(animate);


	player.update();
	composer.render();
	stats.update();
}

animate();