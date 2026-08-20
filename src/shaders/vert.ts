// Full-screen triangle vertex shader. drei's <ScreenQuad> supplies a
// 2-component `position` attribute covering the screen with one triangle.
export const SCREEN_VERT = `attribute vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }`
