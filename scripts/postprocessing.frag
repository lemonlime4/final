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
    float leastDist = 2e64;
    vec3 color = vec3(0,1,0);
    for (int i = 0; i < 16; i++) {
        float dist = length(palette[i] - x);
        if (dist < leastDist) {
            leastDist = dist;
            color = palette[i];
        }
    }
    return color;
}

// void main() {
//     vec3 color = texture2D(tDiffuse, UV).xyz;
//     // color = srgbToLinear(vec3(UV.x));
//     gl_FragColor = vec4(color,1);
//     ivec2 coord = ivec2(floor(gl_FragCoord.xy)) % textureSize(threshold, 0);
//     float threshold = texelFetch(threshold, coord, 0).x;
//     // color = (palette(color + 0.1 * threshold));
//     color = linearToSrgb(color);
//     color = closestColor(color + .2*(threshold - 0.5));
//     color = srgbToLinear(color);
//     // color = coord.x % 2 == 0 ^^ coord.y % 2 ==0 ? vec3(1) : vec3(0);
//     gl_FragColor = vec4(color, 1);
// }

#define TE(x) texelFetch(tDiffuse, x, 0).xyz
#define LU(x) dot(x,vec3(.2126,.7152,.0722))
#define N 3
vec3 f() {
    ivec2 c = ivec2(floor(gl_FragCoord));
    vec3 c1 = vec3(0);
    vec3 c2 = vec3(0);
    vec3 c3 = vec3(0);
    vec3 c4 = vec3(0);
    for (int x = 0; x < N; x++) {
        for (int y = 0; y < N; y++) {
            c1 += TE(c+ivec2(x,y));
            c2 += TE(c+ivec2(-x,y));
            c3 += TE(c+ivec2(-x,-y));
            c4 += TE(c+ivec2(x,-y));
        }
    }
    c1 /= float(N * N);
    c2 /= float(N * N);
    c3 /= float(N * N);
    c4 /= float(N * N);

    float v1 = 0.;
    float v2 = 0.;
    float v3 = 0.;
    float v4 = 0.;
    for (int x = 0; x < N; x++) {
        for (int y = 0; y < N; y++) {
            v1 += pow(LU(c1)-LU(TE(c+ivec2(x,y))),2.);
            v2 += pow(LU(c2)-LU(TE(c+ivec2(-x,y))),2.);
            v3 += pow(LU(c3)-LU(TE(c+ivec2(-x,-y))),2.);
            v4 += pow(LU(c4)-LU(TE(c+ivec2(x,-y))),2.);
        }
    }
    vec3 co = vec3(0);
    float minv = min(min(min(v1,v2),v3),v4);
    if (minv == v1) co = c1;
    if (minv == v2) co = c2;
    if (minv == v3) co = c3;
    if (minv == v4) co = c4;

    return co;
}

void main() {
    vec3 color = texture2D(tDiffuse, UV).xyz;
    // color = srgbToLinear(vec3(UV.x));
    gl_FragColor = vec4(color,1);
    ivec2 coord = ivec2(floor(gl_FragCoord.xy)) % textureSize(threshold, 0);
    float threshold = texelFetch(threshold, coord, 0).x;
    // color = (palette(color + 0.1 * threshold));
    color = linearToSrgb(color);
    color = closestColor(color + .2*(threshold - 0.5));
    color = srgbToLinear(color);
    // color = coord.x % 2 == 0 ^^ coord.y % 2 ==0 ? vec3(1) : vec3(0);
    gl_FragColor = vec4(f(), 1);
}