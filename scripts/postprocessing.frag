const int ditherIterations = 32;
const float ditherErrorFactor = 1.0;

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
    int index = palette.length();
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
vec3 dither(vec3 color) {
    int frequency[palette.length()];
    vec3 error = vec3(0);

    for (int i = 0; i < ditherIterations; i++) {
        vec3 goal = color + error * ditherErrorFactor;
        int closestIndex = closestColor(goal);
        
        frequency[closestIndex] += 1;
        error += color - srgbToLinear(palette[closestIndex]);
    }


    ivec2 coord = ivec2(floor(gl_FragCoord)) % textureSize(threshold, 0);
    int threshold = int(float(ditherIterations - 1) * texelFetch(threshold, coord, 0).x);
    int sum = 0;
 
    for (int i = 0; i < palette.length(); i++) {
        sum += frequency[i];
        if (threshold < sum) {
             return srgbToLinear(palette[i]);
        }
    }
    
    // // Fill the candidate array
    // int candidates[ditherIterations];
    // vec3 error = vec3(0, 0, 0);

    // for (int i = 0; i < ditherIterations; i++)
    // {
    //     vec3 goal = color + error * ditherErrorFactor;
    //     int closestIndex = closestColor(goal);
        
    //     candidates[i] = closestIndex;
    //     error += color - srgbToLinear(palette[closestIndex]);
    // }

    // // Sort the candidate array by luminance (bubble sort)
    // for (int i = ditherIterations - 1; i > 0; i--) 
    // {
    //   for (int j = 0; j < i; j++) 
    //   {
    //       if (luminance(palette[candidates[j]]) > luminance(palette[candidates[j+1]])) 
    //       { 
    //           // Swap the candidates
    //           int t = candidates[j]; 
    //           candidates[j] = candidates[j+1]; 
    //           candidates[j+1] = t; 
    //       }
    //   }
    // }

    // // Select from the candidate array, using the value in the threshold matrix
    // ivec2 coord = ivec2(floor(gl_FragCoord)) % textureSize(threshold, 0);
    // int threshold = int(float(ditherIterations - 1) * texelFetch(threshold, coord, 0).x);
    // return srgbToLinear(palette[candidates[threshold]]);
}

void main() {
    vec3 color = texelFetch(tDiffuse, ivec2(floor(gl_FragCoord)), 0).xyz;
    color = dither(color);
    gl_FragColor = vec4(color, 1);
}