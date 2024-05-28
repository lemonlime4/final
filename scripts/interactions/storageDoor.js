import * as THREE from 'three';
import { dialogTime } from '../dialog.js';



export class StorageDoorInteraction {
    constructor() {
        this.done = false;
        this.box = new THREE.Box3(
            new THREE.Vector3(4.3, 0, 6.3),
            new THREE.Vector3(6.3, 2.3, 7)
        );
        this.cursor = 'walkCursor';
    }

    init() {
        dialogTime('The door is broken from this side.', 2);
        this.done = true;
    }

    update() { }
}