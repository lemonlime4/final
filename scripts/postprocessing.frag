uniform sampler2D tDiffuse;
uniform sampler2D threshold;

uniform vec2 resolution;

varying vec2 UV;

const float PI = 3.1415926535897932384626433832795;
const float INF = 3.4e38;


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
    vec3(0.051,0,0.137),vec3(0.161,0.169,0.275),vec3(0.224,0.337,0.333),vec3(0.553,0.576,0.361),vec3(0.235,0.082,0.129),vec3(0.478,0.278,0.192),vec3(0.773,0.647,0.431),vec3(0.831,0.808,0.765)
);
struct MixingPlan {
    vec3 a;
    vec3 b;
    float t;
};
float colorDistance(vec3 a, vec3 b) {
    return distance(a, b);
}
vec3 dither(vec3 color) {
    ivec2 coord = ivec2(floor(gl_FragCoord)) % textureSize(threshold, 0);
    float threshold = texelFetch(threshold, coord, 0).x;
    color = linearToSrgb(color);

    float leastDist = INF;
    MixingPlan bestPlan;
    for (int i = 0; i < palette.length(); i++) {
        for (int j = 0; j < i; j++) {
            vec3 a = palette[i];
            vec3 b = palette[j];
            vec3 d = b - a;
            float t = dot(color - a, d) / dot(d, d);
            float dist = colorDistance(a + t*d, color);
            if (dist < leastDist) {
                leastDist = dist;
                bestPlan = MixingPlan(a, b, t);
            }
        }
    }

    // color = bestPlan.t < threshold ? bestPlan.a : bestPlan.b;
    color = mix(bestPlan.a, bestPlan.b, step(threshold,bestPlan.t));
    color = srgbToLinear(color);
    return color;
}

void main() {
    vec3 color = texelFetch(tDiffuse, ivec2(floor(gl_FragCoord)), 0).xyz;
    // color = dither(color);
    gl_FragColor = vec4(color, 1);
}