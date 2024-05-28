import * as THREE from 'three';



export class ThingInteraction {
    constructor() {
        this.done = false;
        this.appeared = false;
        this.box = new THREE.Box3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 0)
        );
    }

    init() { }

    update() {
        ;
    }
}