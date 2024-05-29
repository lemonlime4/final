import * as THREE from 'three';
import { player } from '../player.js';
import { startInteraction } from '../dialog.js';
import { audio } from '../audio.js';



export class ElectricalPanelInteraction {
    constructor({ state }) {
        this.done = false;
        this.walked = false;
        this.box = new THREE.Box3(
            new THREE.Vector3(18, 0.4, 10.7),
            new THREE.Vector3(18.7, 1.6, 12.3)
        );

        this.image = document.createElement('img');
        this.image.draggable = false;
        this.image.id = 'electricalInteraction';
        this.image.src = '../../assets/textures/electricalOff.png';
        this.image.addEventListener('click', () => {
            state.devicesPowered = !state.devicesPowered;
            if (state.devicesPowered) {
                this.image.src = '../../assets/textures/electricalOn.png';
                audio.leverOn.currentTime = 0;
                audio.leverOn.play();
            }
            else {
                this.image.src = '../../assets/textures/electricalOff.png';
                audio.leverOff.currentTime = 0;
                audio.leverOff.play();
            }
        })
    }

    init() {
        this.walked = false;
        player.moveTo(new THREE.Vector3(17.5, 0, 11.5));
    }

    update() {
        if (player.path !== null || this.walked) return;
        this.walked = true;
        audio.electricalOpen.currentTime = 0;
        audio.electricalOpen.play();
        startInteraction(
            () => {
                this.done = true;
                audio.electricalClose.currentTime = 0;
                audio.electricalClose.play();
            },
            [this.image]
        );
    }
}