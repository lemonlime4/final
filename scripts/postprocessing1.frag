const int ditherIterations = 32;
const float ditherErrorFactor = 0.8;
const float overlayThreshold = 0.7;
const int controlIconOffset = 16;

uniform sampler2D tDiffuse;
uniform ivec2 resolution;

uniform sampler2D overlay;
uniform sampler2D threshold;
const ivec2 thresholdTextureSize = ivec2(512);

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

ivec2 modvec2(ivec2 x, ivec2 y) {
    return x - (y * ivec2(floor(vec2(x)/vec2(y))));
}







/*
    Dithering
*/

// luminance sorted palette in srgb space
const int paletteLength = 8;


float luminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}
float colorDistance(vec3 a, vec3 b) {
    vec3 diff = b - a;
    return dot(diff, diff);
}

int closestColor(vec3 color, vec3 palette[paletteLength]) {
    float leastDist = INF;
    int index = 0;
    for (int i = 0; i < paletteLength; i++) {
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
vec3 dither(vec3 color, ivec2 fragCoord, vec3 palette[paletteLength]) {
    int frequency[paletteLength];
    vec3 error = vec3(0);

    for (int i = 0; i < ditherIterations; i++) {
        vec3 goal = color + error * ditherErrorFactor;
        int closestIndex = closestColor(goal, palette);
        
        frequency[closestIndex] += 1;
        error += color - srgbToLinear(palette[closestIndex]);
    }


    ivec2 coord = modvec2(fragCoord, thresholdTextureSize);
    int threshold = int(float(ditherIterations - 1) * texture2D(threshold, vec2(coord) / vec2(thresholdTextureSize)).x);
    int sum = 0;
 
    for (int i = 0; i < paletteLength; i++) {
        sum += frequency[i];
        if (threshold < sum) {
             return srgbToLinear(palette[i]);
        }
    }
}








/*
    Screenspace overlay
*/

vec3 overlayImage(vec3 baseColor, sampler2D image, ivec2 size, vec2 pos, ivec2 fragCoord, ivec2 offset)  {
    ivec2 coord = fragCoord - ivec2(floor(0.5 + pos)) - offset * size;
    bool contained = 0 <= coord.x && coord.x < size.x
                  && 0 <= coord.y && coord.y < size.y;
    vec4 overlay = texture2D(image, vec2(coord) / vec2(resolution));
    return mix(
        baseColor,
        overlay.xyz,
        overlay.w * (contained ? 1.0 : 0.0)
    );
}









void main() {
    vec3 palette[paletteLength];
    palette[0] = vec3(0.051,0,0.137);
    palette[1] = vec3(0.235,0.082,0.129);
    palette[2] = vec3(0.161,0.169,0.275);
    palette[3] = vec3(0.224,0.337,0.333);
    palette[4] = vec3(0.478,0.278,0.192);
    palette[5] = vec3(0.553,0.576,0.361);
    palette[6] = vec3(0.773,0.647,0.431);
    palette[7] = vec3(0.831,0.808,0.765);
    
    ivec2 fragCoord = ivec2(floor(gl_FragCoord));
    vec3 color = texture2D(tDiffuse, vec2(fragCoord) / vec2(resolution)).xyz;

    if (alarmed) {
        color = color * vec3(1, 0.05, 0.01);
    }

    color = dither(color, fragCoord, palette);

    vec4 overlayColor = texture2D(overlay, vec2(fragCoord) / vec2(resolution));
    color = mix(
        color,
        srgbToLinear(palette[closestColor(overlayColor.xyz, palette)]),
        step(overlayThreshold, overlayColor.w)
    );
    
    
    ivec2 overlayLocation = resolution - ivec2(controlIconOffset);
    if (controlIconState == 1) {
        color = overlayImage(color, wasdIcon, ivec2(8), vec2(overlayLocation), fragCoord, ivec2(-1, -1));
    }
    if (controlIconState == 2) {
        color = overlayImage(color, mouseIcon, ivec2(8), vec2(overlayLocation), fragCoord, ivec2(-1, -1));
    }


    gl_FragColor = vec4(color, 1);
}