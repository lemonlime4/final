import * as THREE from 'three';
import { player } from '../player.js';
import { startInteraction } from '../dialog.js';
import { papersText } from '../../assets/texts/papers.js';


export class PapersInteraction {
    constructor() {
        this.done = false;
        this.walked = false;
        this.box = new THREE.Box3(
            new THREE.Vector3(5.8, 0, 8.4),
            new THREE.Vector3(7, 0.2, 9.3)
        );
        this.contents = document.createElement('p');
        this.contents.textContent = papersText;
    }

    init() {
        player.moveTo(new THREE.Vector3(5.7, 0, 8.8));
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