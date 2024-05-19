import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Timer } from 'three/addons/misc/Timer.js';
import Stats from 'three/addons/libs/stats.module.js';

const stats = new Stats();
document.body.appendChild(stats.domElement);

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

const pixelRatio = .5;
function onResize() {
	renderer.setPixelRatio(pixelRatio);
	composer.setPixelRatio(pixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight, true);
	composer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
}
onResize();
window.addEventListener('resize', onResize);




camera.position.set(0, 15, 0);
camera.lookAt(new THREE.Vector3());
camera.updateProjectionMatrix();



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

const playerGLTF = await new Promise(resolve =>
	new GLTFLoader().load('../player.glb', resolve));
playerGLTF.scene.children[0].children[0].material.metalness = 0;
scene.add(playerGLTF.scene);
const mixer = new THREE.AnimationMixer(playerGLTF.scene);
const player = {
	model: playerGLTF.scene,
	idleAction: mixer.clipAction(playerGLTF.animations[1]),
	walkAction: mixer.clipAction(playerGLTF.animations[0]),
	path: null,
	moveSpeed: 1,
	turn: null,
	turnSpeed: 3,
	moveTo(point) {
		const dir = point.clone().sub(this.model.position);
		if (!this.path) {
			this.walkAction.enabled = true;
			this.walkAction.setEffectiveWeight(1);
			this.idleAction.crossFadeTo(this.walkAction, .5, true);
		}
		this.path = {
			start: this.model.position.clone(),
			end: point.clone(),
			length: dir.length(),
			completion: 0,
		};
		dir.set(dir.x, 0, dir.z).normalize();
		this.turn = {
			start: this.model.quaternion.clone(),
			end: new THREE.Quaternion()
				.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir),
			completion: 0
		};
	},

	update(dt) {
		mixer.update(dt);
		// turn player
		if (this.turn) {
			this.turn.completion += this.turnSpeed * dt;
			this.model.quaternion
				.copy(this.turn.start)
				.slerp(this.turn.end, this.turn.completion);
			if (this.turn.completion > 1) {
				this.turn = null;
			}
		}

		// move player
		if (this.path) {
			this.path.completion += dt * this.moveSpeed / this.path.length;
			this.model.position.copy(
				this.path.start.clone().lerp(
					this.path.end,
					this.path.completion
				)
			);
			if (this.path.completion > 1) {
				this.path = null;
				this.idleAction.setEffectiveWeight(1);
				this.walkAction.crossFadeTo(this.idleAction, .3, false);
			}
		}
	}
};
player.idleAction.setEffectiveWeight(1);
player.walkAction.setEffectiveWeight(0);
player.idleAction.play();
player.walkAction.play();



const keyDirectionMapping = new Map([
	['KeyW', 'up'],
	['ArrowUp', 'up'],
	['KeyA', 'left'],
	['ArrowLeft', 'left'],
	['KeyS', 'down'],
	['ArrowDown', 'down'],
	['KeyD', 'right'],
	['ArrowRight', 'right'],
]);
const keyboard = {
	up: false,
	down: false,
	left: false,
	right: false,
};
const mouse = {
	x: 0,
	y: 0,
	dx: 0,
	dy: 0,
};

window.addEventListener('keydown', event => {
	const direction = keyDirectionMapping.get(event.code);
	if (direction === undefined) return;
	keyboard[direction] = true;
});

window.addEventListener('keyup', event => {
	const direction = keyDirectionMapping.get(event.code);
	if (direction === undefined) return;
	keyboard[direction] = false;
});

window.addEventListener('mousemove', event => {
	mouse.dx = event.movementX;
	mouse.dy = event.movementY;
	mouse.x = event.clientX;
	mouse.y = event.clientY;
});


const clickable = [map];
const raycaster = new THREE.Raycaster();
window.addEventListener('mousedown', () => {
	const screenspaceMouse = new THREE.Vector2(
		-1 + 2 * mouse.x / window.innerWidth,
		+1 - 2 * mouse.y / window.innerHeight
	);
	raycaster.setFromCamera(screenspaceMouse, camera);
	const intersects = raycaster.intersectObjects(clickable, true);
	if (intersects.length === 0)
		return;
	const point = intersects[0].point;
	player.moveTo(point);
})






const controls = {
	zones: [
		{
			bounds: new THREE.Box3(
				new THREE.Vector3(-.5, 0, -.5),
				new THREE.Vector3(.5, .5, .5)
			),
			camera: {
				from: new THREE.Vector3(0, 15, 0),
				to: new THREE.Vector3(0, 0, 0),
			}
		},
		{
			bounds: new THREE.Box3(
				new THREE.Vector3(-5, -1, -3),
				new THREE.Vector3(-1, 1, 1)
			),
			camera: {
				from: new THREE.Vector3(3, 5, 8),
				to: new THREE.Vector3(0, 0, -0)
			},
		},
		{
			bounds: new THREE.Box3(
				new THREE.Vector3(3, -1, -1),
				new THREE.Vector3(8, 1, 1),
			),
			camera: {
				from: new THREE.Vector3(-8, 15, 1),
				to: new THREE.Vector3(0, 0, 0)
			}
		},
		{
			isFirstPerson: true,
			bounds: new THREE.Box3(
				new THREE.Vector3(2, -1, 2),
				new THREE.Vector3(6, 1, 5)
			),
			camera: {
				euler: new THREE.Euler(),
			}
		}
	],
	activeZone: null,
	update(dt) {
		// handles first person,
		if (this.activeZone?.isFirstPerson) {
			const turnSpeed = .01;
			const euler = this.activeZone.euler;
			euler.x -= turnSpeed * mouse.dy;
			euler.y -= turnSpeed * mouse.dx;
			euler.x = Math.min(Math.PI / 2, Math.max(-Math.PI / 2, euler.x));
			mouse.dx = 0;
			mouse.dy = 0;
			if (player.path) {
				euler.setFromQuaternion(player.model.quaternion);
				euler.y += Math.PI;
			}
			camera.fov = 70;
			camera.updateProjectionMatrix();
			camera.position.copy(player.model.position)
				.add(new THREE.Vector3(0, 1, 0));
			camera.quaternion.setFromEuler(euler);
			camera.updateProjectionMatrix();
			camera.quaternion.setFromEuler(euler);

			if (player.path) return;
			player.model.quaternion.setFromEuler(
				new THREE.Euler(0, euler.y - Math.PI, 0)
			);

			const dx = keyboard.right - keyboard.left;
			const dz = keyboard.up - keyboard.down;
			const v = new THREE.Vector3(-dx, 0, dz)
				.setLength(dt * player.moveSpeed)
				.applyQuaternion(player.model.quaternion);
			player.model.position.add(v);
		}
		const pos = player.model.position;
		if (this.activeZone?.bounds.containsPoint(pos))
			return;
		const zone = this.zones
			.find(zone => zone.bounds.containsPoint(pos));
		if (!zone) return;

		if (zone.isFirstPerson) {
			camera.fov = 70;
			zone.euler = new THREE.Euler(0, 0, 0, 'YXZ');
			camera.updateProjectionMatrix();
		}
		else {
			camera.position.copy(zone.camera.from);
			camera.lookAt(zone.camera.to);
		}
		this.activeZone = zone;
	}
};
for (const zone of controls.zones) {
	scene.add(new THREE.Box3Helper(zone.bounds));
}


const axes = new THREE.AxesHelper(5);
axes.position.set(0, 1, 0);
scene.add(axes);
player.model.lookAt(new THREE.Vector3(0, 0, 10))
function animate() {
	requestAnimationFrame(animate);
	const dt = 1 / 40;

	player.update(dt);
	controls.update(dt);
	composer.render();
	stats.update();
	// console.log(controls.zones.indexOf(controls.activeZone));
}

animate();



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