precision mediump float;
uniform sampler2D uSampler;
uniform float uTime;
varying vec2 vTexCoord;

void main() {
  vec2 uv = vTexCoord;
  float amplitude = 0.01;
  float frequency = 5.0;
  float waveX = sin(frequency * uv.y + uTime) * amplitude;
  float waveY = sin(frequency * uv.x + uTime) * amplitude;
  
  uv.x += waveX;
  uv.y += waveY;
  
  gl_FragColor = texture2D(uSampler, uv);
}