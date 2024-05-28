const int ditherIterations = 8;
const float ditherErrorFactor = 0.8;
const float overlayThreshold = 0.7;
const int controlIconOffset = 16;

uniform sampler2D tDiffuse;
uniform ivec2 resolution;

uniform sampler2D overlay;
uniform sampler2D threshold;

uniform sampler2D wasdIcon;
uniform sampler2D mouseIcon;
uniform int controlIconState;

uniform bool alarmed;



const float PI = 3.1415926535897932384626433832795;
const float INF = 3.4e38;
varying vec2 UV;


vec3 linearToSrgb(vec3 x) {
    return pow(x, vec3(1./2.2));
}

vec3 srgbToLinear(vec3 x) {
    return pow(x, vec3(2.2));
}








/*
    Dithering
*/

// luminance sorted palette in srgb space
const vec3 palette[] = vec3[](
    vec3(0.051,0,0.137),
    vec3(0.235,0.082,0.129),
    vec3(0.161,0.169,0.275),
    vec3(0.224,0.337,0.333),
    vec3(0.478,0.278,0.192),
    vec3(0.553,0.576,0.361),
    vec3(0.773,0.647,0.431),
    vec3(0.831,0.808,0.765)
);

float luminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}
float colorDistance(vec3 a, vec3 b) {
    vec3 diff = b - a;
    return dot(diff, diff);
}

int closestColor(vec3 color) {
    float leastDist = INF;
    int index = 0;
    for (int i = 0; i < palette.length(); i++) {
        vec3 entry = srgbToLinear(palette[i]);
        float dist = colorDistance(entry, color);
        if (dist < leastDist) {
            leastDist = dist;
            index = i;
        }
    }
    return index;
}

// modified pattern dithering algorithm
// dithering in srgb space would be more accurate but it produces heavy banding
vec3 dither(vec3 color, ivec2 fragCoord) {
    int frequency[palette.length()];
    vec3 error = vec3(0);

    for (int i = 0; i < ditherIterations; i++) {
        vec3 goal = color + error * ditherErrorFactor;
        int closestIndex = closestColor(goal);
        
        frequency[closestIndex] += 1;
        error += color - srgbToLinear(palette[closestIndex]);
    }


    ivec2 coord = fragCoord % textureSize(threshold, 0);
    int threshold = int(float(ditherIterations - 1) * texelFetch(threshold, coord, 0).x);
    int sum = 0;
 
    for (int i = 0; i < palette.length(); i++) {
        sum += frequency[i];
        if (threshold < sum) {
             return srgbToLinear(palette[i]);
        }
    }
}








/*
    Screenspace overlay
*/

vec3 overlayImage(vec3 baseColor, sampler2D image, vec2 pos, ivec2 fragCoord, ivec2 offset)  {
    ivec2 size = textureSize(image, 0);
    ivec2 coord = fragCoord - ivec2(round(pos)) - offset * textureSize(image, 0);
    bool contained = 0 <= coord.x && coord.x < size.x
                  && 0 <= coord.y && coord.y < size.y;
    vec4 overlay = texelFetch(image, coord, 0);
    return mix(
        baseColor,
        palette[closestColor(overlay.xyz)],
        overlay.w * (contained ? 1.0 : 0.0)
    );
}









void main() {
    ivec2 fragCoord = ivec2(floor(gl_FragCoord));
    vec3 color = texelFetch(tDiffuse, fragCoord, 0).xyz;

    if (alarmed) {
        color = color * vec3(1, 0.05, 0.01);
    }

    color = dither(color, fragCoord);

    vec4 overlayColor = texelFetch(overlay, fragCoord, 0);
    color = mix(
        color,
        srgbToLinear(palette[closestColor(overlayColor.xyz)]),
        step(overlayThreshold, overlayColor.w)
    );
    
    
    ivec2 overlayLocation = resolution - ivec2(controlIconOffset);
    if (controlIconState == 1) {
        color = overlayImage(color, wasdIcon, vec2(overlayLocation), fragCoord, ivec2(-1, -1));
    }
    if (controlIconState == 2) {
        color = overlayImage(color, mouseIcon, vec2(overlayLocation), fragCoord, ivec2(-1, -1));
    }


    gl_FragColor = vec4(color, 1);
}