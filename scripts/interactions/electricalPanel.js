import * as THREE from 'three';
import { player } from '../player.js';
import { startInteraction } from '../dialog.js';



export class ElectricalPanelInteraction {
    constructor({ state }) {
        this.done = false;
        this.walked = false;
        this.box = new THREE.Box3(
            new THREE.Vector3(18, 0.4, 10.7),
            new THREE.Vector3(18.7, 1.6, 12.3)
        );

        this.element = document.createElement('img');
        this.element.addEventListener('click', () => {
            state.devicesPowered = !state.devicesPowered;
            console.log('machine is recieving power: ' + state.devicesPowered);
        })
    }

    init() {
        this.walked = false;
        player.moveTo(new THREE.Vector3(17.5, 0, 11.5));
    }

    update() {
        if (player.path !== null || this.walked) return;
        this.walked = true;
        startInteraction(
            () => this.done = true,
            [this.element]
        );
    }
}