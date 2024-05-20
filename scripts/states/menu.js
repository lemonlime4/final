import { State } from "./interface";

class MenuState extends State {
    constructor({ player, camera }) {
        super();
        this.player = player;
        player.model.visible = false;
    }

    exit() {
        this.player.model.visible = true;
    }

    handleClick() {
        ;
    }
}