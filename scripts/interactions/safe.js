import * as THREE from 'three';
import { player } from '../player.js';



export class SafeInteraction {
    constructor() {
        this.done = false;
        this.box = new THREE.Box3(
            new THREE.Vector3(0.2, 0, 11.5),
            new THREE.Vector3(1, 1.1, 12.3)
        );
    }

    init() {
        player.moveTo(new THREE.Vector3(1.8, 0, 11.9));
    }

    update() {
        if (player.path === null) {

        }
    }
}