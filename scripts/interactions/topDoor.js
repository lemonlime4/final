import * as THREE from 'three';
import { player } from '../player.js';
import { audio } from '../audio.js';



export class TopDoorInteraction {
    constructor() {
        this.done = false;
        this.walked = false;
        this.box = new THREE.Box3(
            new THREE.Vector3(4.3, 0, 5.7),
            new THREE.Vector3(6, 2.25, 6.3)
        );
        this.cursor = 'walkCursor';
    }

    init() {
        this.walked = false;
        player.moveTo(new THREE.Vector3(5.6, 0, 5.4));
    }

    update() {
        if (player.path !== null || this.walked) return;
        this.walked = true;
        audio.topDoor.currentTime = 0;
        audio.topDoor.play();
        setTimeout(() => {
            player.model.position.set(5.6, 0, 7.3);
            this.done = true;
        }, 250);
    }
}