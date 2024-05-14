uniform sampler2D tDiffuse;
uniform sampler2D threshold;

varying vec2 UV;


vec3 linearToSrgb(vec3 x) {
    return pow(x, vec3(1./2.2));
}

vec3 srgbToLinear(vec3 x) {
    return pow(x, vec3(2.2));
}

const vec3 palette[16] = vec3[](
    vec3(0.031,0,0),vec3(0.125,0.102,0.043),vec3(0.263,0.157,0.09),vec3(0.286,0.161,0.063),vec3(0.137,0.263,0.035),vec3(0.365,0.31,0.118),vec3(0.612,0.42,0.125),vec3(0.663,0.133,0.059),vec3(0.169,0.204,0.486),vec3(0.169,0.455,0.035),vec3(0.816,0.792,0.251),vec3(0.91,0.627,0.467),vec3(0.416,0.58,0.671),vec3(0.835,0.769,0.702),vec3(0.988,0.906,0.431),vec3(0.988,0.98,0.886)
);
vec3 closestColor(vec3 x) {
    return floor(8.*x)/7.;
}

void main() {
    vec3 color = texture2D(tDiffuse, UV).xyz;
    // color = srgbToLinear(vec3(UV.x));

    ivec2 coord = ivec2(mod(gl_FragCoord.xy, vec2(textureSize(threshold, 0))));
    float threshold = texelFetch(threshold, coord, 0).x;
    // color = (palette(color + 0.1 * threshold));
    color = linearToSrgb(color);
    color = closestColor(color + .2*(threshold - 0.5));
    color = srgbToLinear(color);
    // color = coord.x % 2 == 0 ^^ coord.y % 2 ==0 ? vec3(1) : vec3(0);
    gl_FragColor = vec4(color, 1);
}