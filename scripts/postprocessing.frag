uniform sampler2D tDiffuse;
uniform sampler2D threshold;

varying vec2 UV;


vec3 linearToSrgb(vec3 x) {
    return pow(x, vec3(1./2.2));
}

vec3 srgbToLinear(vec3 x) {
    return pow(x, vec3(2.2));
}

// const vec3 palette[16] = vec3[](
//     vec3(0.031,0,0),vec3(0.125,0.102,0.043),vec3(0.263,0.157,0.09),vec3(0.286,0.161,0.063),vec3(0.137,0.263,0.035),vec3(0.365,0.31,0.118),vec3(0.612,0.42,0.125),vec3(0.663,0.133,0.059),vec3(0.169,0.204,0.486),vec3(0.169,0.455,0.035),vec3(0.816,0.792,0.251),vec3(0.91,0.627,0.467),vec3(0.416,0.58,0.671),vec3(0.835,0.769,0.702),vec3(0.988,0.906,0.431),vec3(0.988,0.98,0.886)
// );
const vec3 palette[] = vec3[](
    vec3(0), vec3(.2), vec3(.4), vec3(.6), vec3(.8), vec3(1)
);
vec3 closestColor(vec3 x) {
    float leastDist = 2e64;
    vec3 color = vec3(0,1,0);
    for (int i = 0; i < palette.length(); i++) {
        float dist = length(palette[i] - x);
        if (dist < leastDist) {
            leastDist = dist;
            color = palette[i];
        }
    }
    return color;
}

vec3 dither(vec3 color) {
    ivec2 coord = ivec2(floor(gl_FragCoord.xy)) % textureSize(threshold, 0);
    float threshold = texelFetch(threshold, coord, 0).x;
    color = linearToSrgb(color);
    color = closestColor(color + .5*(threshold - 0.5));
    color = srgbToLinear(color);
    return color;
}

void main() {
    vec3 color = texelFetch(tDiffuse, ivec2(floor(gl_FragCoord)), 0).xyz;
    gl_FragColor = vec4(color, 1);
}