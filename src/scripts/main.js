import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Timer } from 'three/addons/misc/Timer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Stats from 'three/addons/libs/stats.module.js';

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
	moveSpeed: 1,
	turn: null,
	turnSpeed: 3,
	moveTo(point) {
		const dir = point.clone().sub(this.model.position);
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
			}
		}
	}
};


const mouse = {
	position: new THREE.Vector2(0, 0),
};
window.addEventListener('pointermove', event => {
	mouse.position.set(
		-1 + 2 * event.clientX / window.innerWidth,
		1 - 2 * event.clientY / window.innerHeight
	);
})


const clickable = map;
const raycaster = new THREE.Raycaster();
window.addEventListener('mousedown', () => {
	mouse.position.set(
		-1 + 2 * event.clientX / window.innerWidth,
		1 - 2 * event.clientY / window.innerHeight
	);
	raycaster.setFromCamera(mouse.position, camera);
	const intersects = raycaster.intersectObject(clickable);
	if (intersects.length === 0) {
		return;
	};
	const point = intersects[0].point;
	// ball.position.copy(point);
	// ball.visible = true;
	player.moveTo(point);
})


window.c = camera;
class FixedCameraController {
	constructor(cameraFrom, cameraTo) {
		this.from = cameraFrom;
		this.to = cameraTo;
		;
	}
	updateCamera() {
		camera.position.copy(this.from);
		camera.lookAt(this.to);
	}
	updatePlayer() {
		;
	}
}

const keys = {
	up: false,
	down: false,
	left: false,
	right: false
};
window.addEventListener('keydown', event => {
	if (event.code === 'KeyW') keys.up = true;
	if (event.code === 'KeyA') keys.left = true;
	if (event.code === 'KeyS') keys.down = true;
	if (event.code === 'KeyD') keys.right = true;
})
window.addEventListener('keyup', event => {
	if (event.code === 'KeyW') keys.up = false;
	if (event.code === 'KeyA') keys.left = false;
	if (event.code === 'KeyS') keys.down = false;
	if (event.code === 'KeyD') keys.right = false;
})
const pointer = {
	dx: 0,
	dy: 0
};
window.addEventListener('mousemove', event => {
	pointer.dx = event.movementX;
	pointer.dy = event.movementY;
})

class FirstPersonController {
	constructor() {
		const playerAngle = new THREE.Euler(0, 0, 0, 'YXZ')
			.setFromQuaternion(player.model.quaternion);
		this.angles = playerAngle;
		this.turnSpeed = 0.01;
	}
	updateCamera() {
		this.angles.x -= this.turnSpeed * pointer.dy;
		this.angles.y -= this.turnSpeed * pointer.dx;
		pointer.dx = 0;
		pointer.dy = 0;
		if (player.path) {
			this.angles.setFromQuaternion(player.model.quaternion);
			this.angles.y += Math.PI;
		}
		camera.fov = 70;
		camera.updateProjectionMatrix();
		camera.position.copy(player.model.position)
			.add(new THREE.Vector3(0, 1, 0));
		camera.quaternion.setFromEuler(this.angles);
		camera.updateProjectionMatrix();
	}
	updatePlayer(dt) {
		if (player.path) return;
		player.model.quaternion.setFromEuler(
			new THREE.Euler(0, this.angles.y - Math.PI, 0)
		);
		const dx = dt * player.moveSpeed * (keys.right - keys.left);
		const dz = dt * player.moveSpeed * (keys.up - keys.down);
		const q = player.model.quaternion;
		console.log(dx, dz);
		player.model.position.addScaledVector(
			new THREE.Vector3(-1, 0, 0).applyQuaternion(q), dx);
		player.model.position.addScaledVector(
			new THREE.Vector3(0, 0, 1).applyQuaternion(q), dz);
	}
}



const controls = {
	zones: [
		{
			bounds: new THREE.Box3(
				new THREE.Vector3(-.5, 0, -.5).add(player.model.position),
				new THREE.Vector3(.5, .5, .5).add(player.model.position)
			),
			controls: new FixedCameraController(
				new THREE.Vector3(0, 20, 0),
				new THREE.Vector3(0, 0, 0)
			)
		},
		{
			bounds: new THREE.Box3(
				new THREE.Vector3(-5, -1, -3),
				new THREE.Vector3(-1, 1, 1)
			),
			controls: new FixedCameraController(
				new THREE.Vector3(3, 15, 15),
				new THREE.Vector3(0, 0, -0)
			),
		},
		{
			bounds: new THREE.Box3(
				new THREE.Vector3(3, -1, -1),
				new THREE.Vector3(8, 1, 1),
			),
			controls: new FixedCameraController(
				new THREE.Vector3(-8, 15, 1),
				new THREE.Vector3(0, 0, 0)
			)
		},
		{
			bounds: new THREE.Box3(
				new THREE.Vector3(2, -1, 2),
				new THREE.Vector3(6, 1, 5)
			),
			controls: new FirstPersonController(
				new THREE.Vector3(-8, 10, 1),
				new THREE.Vector3(0, 0, 0)
			)
		}
	],
	activeZone: null,
	update(dt) {
		if (this.activeZone) {
			this.activeZone.controls.updateCamera();
			this.activeZone.controls.updatePlayer(dt);
		}
		const pos = player.model.position;
		if (this.activeZone?.bounds.containsPoint(pos))
			return;
		const zone = this.zones
			.find(zone => zone.bounds.containsPoint(pos));
		if (!zone) return;
		this.activeZone = zone;
	}
};
for (const zone of controls.zones) {
	scene.add(new THREE.Box3Helper(zone.bounds));
}


scene.add(new THREE.AxesHelper(5));
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