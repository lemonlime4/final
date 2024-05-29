## Dépendences
- WebGL2, avec GPU si possible

## Optimisations
- dans `scripts/options.js`, diminuer la valeur de `pixelRatio`
    (`1 / 6` par exemple)
- dans `scripts/postprocessing.frag`, réduire `ditherIterations`


## Ressources utilisées
Algorithme de tramage: https://www.shadertoy.com/view/dlcGzN
Textures: https://polyhaven.com/, Google et Pinterest
Polices: Bebas Neue (sur Google Fonts) et Dogica Pixel https://rmocci.itch.io/dogica
Effets sonores: https://pixabay.com/sound-effects/
`assets/textures/launchEnding.mp4`: https://youtu.be/MaP_qTppD_c
`assets/sounds/music.mp4`: Depot Entrance du jeu Who's Lila?
Visage du joueur: Strupnev du jeu Who's Lila?



## Code et contenu non utilisé (non exhaustive)
- `assets/textures/launchEnding.mp4`
- `assets/textures/bayer.png`
- `assets/fonts/dogicaPixelBold.woff2`
- `boundingPolygon` de `scripts/scene.js`
- `dialogCallback` de `scripts/dialog.js`