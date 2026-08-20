// The signature oil-slick shader, lifted verbatim from the design handoff.
// This string is the live-editable source shown in the in-page editor.
export const WARP_FRAG_DEFAULT = `precision highp float;
uniform float u_time; uniform vec2 u_res; uniform vec2 u_mouse;
uniform float u_speed; uniform float u_warp; uniform float u_amp;
uniform vec3 u_c0; uniform vec3 u_c1; uniform vec3 u_c2; uniform vec3 u_c3;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<6;i++){ v+=a*noise(p); p=m*p; a*=0.5; } return v; }
void main(){
  vec2 uv=gl_FragCoord.xy/u_res.xy;
  vec2 p=(uv-0.5); p.x*=u_res.x/u_res.y; p*=2.2;
  float t=u_time*0.11*u_speed; vec2 mo=(u_mouse-0.5)*1.3;
  vec2 q=vec2(fbm(p+t), fbm(p+vec2(5.2,1.3)-t));
  vec2 r=vec2(fbm(p+u_warp*q+vec2(1.7,9.2)+0.15*t+mo), fbm(p+u_warp*q+vec2(8.3,2.8)-0.12*t+mo));
  float f=fbm(p+u_warp*r);
  vec2 ruv = uv + (r-0.5)*0.10 + (q-0.5)*0.05;
  vec3 skyTop = vec3(0.34,0.52,0.78);
  vec3 skyHor = vec3(0.82,0.87,0.93);
  vec3 sky = mix(skyHor, skyTop, clamp(ruv.y*1.1,0.0,1.0));
  float sun = exp(-7.0*length(ruv-vec2(0.72,0.88)));
  sky += vec3(1.0,0.96,0.86)*sun*0.55;
  float leafB = fbm(ruv*vec2(5.0,9.0)+vec2(0.0,t*0.3));
  float folB = smoothstep(0.34,0.0, ruv.y + leafB*0.20 - 0.02);
  float leafT = fbm(ruv*vec2(6.0,7.0)+9.0);
  float folT = smoothstep(0.18,0.0, (1.0-ruv.y) + leafT*0.16) * smoothstep(0.5,0.0,abs(ruv.x-0.15));
  float fol = clamp(max(folB, folT),0.0,1.0);
  vec3 foliage = mix(vec3(0.02,0.06,0.03), vec3(0.05,0.12,0.05), leafB);
  vec3 scene = mix(sky, foliage, fol);
  float thick = f*1.6 + length(r)*0.6;
  float ph = fract(thick*1.4);
  vec3 irid = mix(u_c0, u_c1, smoothstep(0.0,0.34,ph));
  irid = mix(irid, u_c2, smoothstep(0.34,0.67,ph));
  irid = mix(irid, u_c3, smoothstep(0.67,1.0,ph));
  vec3 col = scene;
  col = mix(col, col*(0.4+1.2*irid), 0.6*u_amp);
  col += irid * pow(clamp(f,0.0,1.0),2.0) * 0.5 * u_amp;
  col *= 1.0 - 0.4*length(uv-0.5);
  gl_FragColor=vec4(col,1.0);
}`
