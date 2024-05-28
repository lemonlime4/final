// Factored out a bunch of constants to make them easier to edit.

export const options = {
    gameTitle: 'BALLISTIC',
    maxDt: 1000 / 20,
    fov: 45,
    pixelRatio: 1 / 2,
    walkSpeed: 1 * 6,
    turnSpeed: 4,
    firstPersonFov: 80,
    firstPersonHeight: 1.6,
    firstPersonSpeed: 2 * 6,
    firstPersonSensitivity: .005,
    firstPersonKeyMapping: new Map([
        ['KeyW', 'up'],
        ['ArrowUp', 'up'],
        ['KeyA', 'left'],
        ['ArrowLeft', 'left'],
        ['KeyS', 'down'],
        ['ArrowDown', 'down'],
        ['KeyD', 'right'],
        ['ArrowRight', 'right'],
    ]),
    ditherThresholdMap: 'bluenoise.png',
}