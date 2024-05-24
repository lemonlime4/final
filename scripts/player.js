import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



export const player = {
    path: null,
    turn: null,
    ...await new Promise(resolve => gltfLoader.load(
        'player.glb',
        gltf => {
            const model = gltf.scene;
            const mixer = new THREE.AnimationMixer(model);
            const walkAction = mixer.clipAction(
                THREE.AnimationClip
                    .findByName(gltf.animations, 'Walk')
            );
            const idleAction = mixer.clipAction(
                THREE.AnimationClip
                    .findByName(gltf.animations, 'Idle')
            );

            scene.add(model);
            walkAction.setEffectiveWeight(0);
            idleAction.setEffectiveWeight(1);
            walkAction.play();
            idleAction.play();
            resolve({
                model, mixer, walkAction, idleAction
            });
        }
    )),

    walk() {
        this.walkAction.enabled = true;
        this.walkAction.setEffectiveWeight(1);
        this.idleAction.crossFadeTo(this.walkAction, .5 / options.walkSpeed, true)
        this.walkAction.setEffectiveTimeScale(options.walkSpeed);
    },

    stopWalking() {
        this.idleAction.enabled = true;
        this.idleAction.setEffectiveWeight(1);
        this.walkAction.crossFadeTo(this.idleAction, .3 / options.walkSpeed, true);
    },

    moveTo(point) {
        if (!this.path) this.walk();

        // set movement path and turning
        const dir = point.clone().sub(this.model.position);
        this.path = {
            start: this.model.position.clone(),
            end: point.clone(),
            length: dir.length(),
            completion: 0
        };
        this.turn = {
            start: this.model.quaternion.clone(),
            end: new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 0, 1),
                dir.set(dir.x, 0, dir.z).normalize()
            ),
            completion: 0
        };
    },

    update(dt) {
        // for animation
        this.mixer.update(dt);

        // turn player
        if (this.turn) {
            this.turn.completion += options.turnSpeed * dt;
            this.model.quaternion
                .copy(this.turn.start)
                .slerp(this.turn.end, this.turn.completion);
            if (this.turn.completion > 1) {
                this.turn = null;
            }
        }

        // move player
        if (this.path) {
            this.path.completion += dt * options.walkSpeed / this.path.length;
            this.model.position.copy(
                this.path.start.clone().lerp(
                    this.path.end,
                    this.path.completion
                )
            );
            if (this.path.completion > 1) {
                this.path = null;
                this.stopWalking();
            }
        }
    },
};