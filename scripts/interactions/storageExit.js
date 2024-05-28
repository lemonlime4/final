import * as THREE from 'three';
import { dialogTime } from '../dialog.js';



export class StorageExitInteraction {
    constructor() {
        this.done = false;
        this.box = new THREE.Box3(
            new THREE.Vector3(0, 0, 8.1),
            new THREE.Vector3(0.3, 2.3, 9.3)
        );
    }

    init() {
        dialogTime('I can\'t leave this place yet.', 2);
        this.done = true;
    }

    update() { }
}