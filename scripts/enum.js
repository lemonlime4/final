export function makeEnum(descriptor, variants) {
    return Object.freeze(Object.setPrototypeOf(
        Object.fromEntries(variants.map(variant => [
            variant,
            Symbol(descriptor + ' / ' + variant)
        ])),
        null
    ));
}