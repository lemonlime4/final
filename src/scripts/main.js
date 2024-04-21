import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Timer } from 'three/addons/misc/Timer.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('canvas'),
});
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new OutputPass());

function onResize() {
	renderer.setPixelRatio(.5);
	composer.setPixelRatio(.5);
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

const player = {

};

window.addEventListener('mousemove', event => {
	pointer.set(
		-1 + 2 * event.clientX / window.innerWidth,
		1 - 2 * event.clientY / window.innerHeight
	);
})
function animate() {
	requestAnimationFrame(animate);

	// camera.position.applyAxisAngle(new THREE.Vector3(1, 2, 3).normalize(), .01);
	// camera.lookAt(new THREE.Vector3());

	composer.render();
}

animate();