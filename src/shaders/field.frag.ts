// Sine-interference field shader (the "Shader Field" demo), verbatim from the handoff.
export const FIELD_FRAG = `precision highp float;
uniform float u_time; uniform vec2 u_res; uniform vec2 u_mouse; uniform float u_speed;
uniform vec3 u_c0; uniform vec3 u_c1; uniform vec3 u_c2;
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv - 0.5; p.x *= u_res.x / u_res.y;
  p += (u_mouse - 0.5) * 0.35;
  float t = u_time * 0.26 * u_speed;
  float v = sin(p.x*6.0+t) + sin(p.y*6.0+t*1.3) + sin((p.x+p.y)*4.5+t*0.7);
  v += sin(length(p)*3.2*4.0 - t*1.6); v *= 0.25;
  float g = smoothstep(-0.25, 0.85, v);
  vec3 col = mix(vec3(0.09,0.08,0.12), u_c0, g);
  col = mix(col, u_c1, smoothstep(0.3,1.0,g)*0.6);
  col = mix(col, u_c2, pow(smoothstep(0.55,1.0,1.0-g),2.0)*0.45);
  col *= 1.0 - 0.5*length(uv-0.5);
  gl_FragColor = vec4(col, 1.0);
}`
