// Full-screen triangle vertex shader. <ShaderCanvas> binds a 2-component
// `position` attribute (location 0) holding one triangle that covers the screen.
export const SCREEN_VERT = `attribute vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }`
