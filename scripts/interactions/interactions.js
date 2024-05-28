// Hardcoded scene interactions for fixed camera mode.

import * as THREE from 'three';
import { player } from '../player.js';
import { dialogCallback, dialogTime, dialogChoice } from '../dialog.js';


export { DevicesInteraction } from './devices.js';
export { DrawerInteraction } from './drawer.js';
export { ElectricalPanelInteraction } from './electricalPanel.js';
export { PapersInteraction } from './papers.js';
export { SafeInteraction } from './safe.js';
export { StorageDoorInteraction } from './storageDoor.js';
export { StorageExitInteraction } from './storageExit.js';
export { ThingInteraction } from './thing.js';
export { TopDoorInteraction } from './topDoor.js';





export const initialToTopPosition = new THREE.Vector3(3.2, 0, 0.9);


export const walkInteractions = [
    { // to initial
        box: new THREE.Box3(
            new THREE.Vector3(2.3, -.1, .3),
            new THREE.Vector3(4.5, 2.5, 1)
        ),
        targets: new Map([
            ["Top", new THREE.Vector3(1.7, 0, 0.9)]
        ]),
    },
    {
        box: new THREE.Box3(
            new THREE.Vector3(9, -.1, 5.5),
            new THREE.Vector3(12, 2.5, 8)
        ),
        targets: new Map([
            ["Top", new THREE.Vector3(11, 0, 7.8)],
            ["Boiler", new THREE.Vector3(11, 0, 5.6)]
        ]),
    },
    {
        box: new THREE.Box3(
            new THREE.Vector3(10.1, -.1, 12.1),
            new THREE.Vector3(12, 2.5, 14.6)
        ),
        targets: new Map([
            ["Boiler", new THREE.Vector3(11, 0, 14.5)],
            ["Bottom", new THREE.Vector3(11, 0, 12.4)],
        ]),
    },
    {
        box: new THREE.Box3(
            new THREE.Vector3(.6, -.1, 13.3),
            new THREE.Vector3(3, 2.5, 14.8)
        ),
        targets: new Map([
            ["Bottom", new THREE.Vector3(1.7, 0, 13.3)],
            ["Storage", new THREE.Vector3(1.7, 0, 14.5)],
        ]),
    },
];



export class WalkInteraction {
    constructor(destination) {
        this.cancellable = true;
        this.done = false;
        this.destination = destination;
    }

    init() {
        player.moveTo(this.destination);
    }

    update(dt) {
        if (player.path === null)
            this.done = true;
    }
}



















