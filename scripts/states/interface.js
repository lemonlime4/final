export class State {
    enter() { throw new Error('unimplemented interface method'); }
    leave() { }
    update() { throw new Error('interface method called'); }
    handleClick() { throw new Error('interface method called'); }
    handleMousemove() { }
    handleKeydown() { }
    handleKeyup() { }
}