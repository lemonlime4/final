export class Player {
    constructor({ position, model }) {
        this.position = new THREE.Vector2();
        this.model = model;
        this.setPosition(position);
    }

    setPosition(position) {
        this.position.copy(position);
        this.model.position.set(position.x, 0, position.y);
    }


}