const int ditherIterations = 32;
const float ditherErrorFactor = 0.8;
const float overlayThreshold = 0.7;

uniform sampler2D tDiffuse;
uniform sampler2D overlay;
uniform sampler2D threshold;
uniform sampler2D normalCursor;

uniform vec2 resolution;
uniform vec2 mousePosition;
uniform int mouseState;

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

vec3 overlayImage(vec3 baseColor, sampler2D image, vec2 pos, ivec2 fragCoord)  {
    ivec2 size = textureSize(image, 0);
    ivec2 coord = fragCoord - ivec2(round(pos));
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

    color = dither(color, fragCoord);

    vec4 overlayColor = texelFetch(overlay, fragCoord, 0);
    color = mix(color, overlayColor.xyz, step(overlayThreshold, overlayColor.w));
    color = srgbToLinear(palette[closestColor(color)]);
    
    #define OVERLAY_IMAGE(S, O) color = overlayImage(color, S, mousePosition, fragCoord - O)
    switch (mouseState) {
        case 0: break;
        case 1:
            OVERLAY_IMAGE(normalCursor, ivec2(0, -8));
            break;
        case 2:
            OVERLAY_IMAGE(tDiffuse, ivec2(0,0));
    }
    #undef OVERLAY_IMAGE

    gl_FragColor = vec4(color, 1);
}