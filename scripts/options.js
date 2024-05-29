// Factored out a bunch of constants to make them easier to edit.

export const options = {
    enableStatistics: false,
    gameTitle: 'BALLISTIC',
    allottedTime: 5 * 60,
    maxDt: 1000 / 20,
    fov: 45,
    pixelRatio: 1 / 2,
    walkSpeed: 1.5,
    turnSpeed: 4,
    firstPersonFov: 80,
    firstPersonSpeed: 3,
    firstPersonHeight: 1.6,
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