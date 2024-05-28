import * as THREE from 'three';
import { player } from '../player.js';
import { startInteraction } from '../dialog.js';



export class ElectricalPanelInteraction {
    constructor() {
        this.done = false;
        this.walked = false;
        this.box = new THREE.Box3(
            new THREE.Vector3(18, 0.4, 10.7),
            new THREE.Vector3(18.7, 1.6, 12.3)
        );
        this.element = document.createElement('img');
        this.toControlPanel = 'true';
    }

    init() {
        player.walkTo(new THREE.Vector3(17.5, 0, 11.5));
    }

    update() {
        if (player.path !== null || !this.walked) {
            this.walked = true;
            startInteraction(
                () => {
                    this.walked = false;
                    this.done = true;
                },
                [this.container]
            );
        }
    }
}