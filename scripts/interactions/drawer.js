import * as THREE from 'three';
import { player } from '../player.js';
import { startInteraction } from '../dialog.js';
import { drawerText } from '../../assets/texts/drawer.js';



export class DrawerInteraction {
    constructor() {
        this.done = false;
        this.walked = false;
        this.box = new THREE.Box3(
            new THREE.Vector3(10.4, 0, 1.6),
            new THREE.Vector3(11.5, 1.2, 4)
        );
        this.contents = document.createElement('p');
        this.contents.textContent = drawerText;
    }

    init() {
        player.moveTo(new THREE.Vector3(10, 0, 2.8));
    }

    update() {
        if (player.path !== null || this.walked) return;
        this.walked = true;
        startInteraction(
            () => {
                this.walked = false;
                this.done = true;
            },
            [this.contents]
        );
    }
}