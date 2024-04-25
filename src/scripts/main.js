import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Timer } from 'three/addons/misc/Timer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Stats from 'https://cdn.jsdelivr.net/npm/stats-js@1.0.1/src/Stats.js';

const stats = new Stats();
document.body.appendChild(stats.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('canvas'),
});
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new OutputPass());

const pixelRatio = .25;
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


const timer = new Timer();


const room = new THREE.Mesh(
	new THREE.BoxGeometry(8, 2, 6),
	new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.BackSide })
);
scene.add(room);

{
	const light = new THREE.PointLight(0xffffff, 2);
	light.position.set(0, 0, 0);
	scene.add(light);
}

camera.position.set(1, 0, 2);
camera.lookAt(new THREE.Vector3());
camera.updateProjectionMatrix();



const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const player = await new Promise(resolve => new GLTFLoader().load(
	'../../assets/player.glb',
	gltf => {
		gltf.scene.scale.set(1.5, 1.5, 1.5);
		resolve(gltf.scene);
	}
));
scene.add(player);
window.p = player;

window.addEventListener('pointermove', event => {
	pointer.set(
		-1 + 2 * event.clientX / window.innerWidth,
		1 - 2 * event.clientY / window.innerHeight
	);
})

const ball = new THREE.Mesh(
	new THREE.IcosahedronGeometry(.1, 2),
	new THREE.MeshBasicMaterial(0xff0000)
);
ball.visible = false;
scene.add(ball);
const clickable = room;
window.addEventListener('pointerdown', () => {
	raycaster.setFromCamera(pointer, camera);
	const intersects = raycaster.intersectObject(clickable);
	if (intersects.length === 0) {
		ball.visible = false;
		return;
	};
	console.log(intersects[0]);
	const point = intersects[0].point;
	// ball.position.copy(point);
	// ball.visible = true;
	player.position.copy(point);
})
function animate() {
	requestAnimationFrame(animate);

	// camera.position.applyAxisAngle(new THREE.Vector3(1, 2, 3).normalize(), .01);
	// camera.lookAt(new THREE.Vector3());

	composer.render();
	stats.update();
	controls.update();
}

animate();