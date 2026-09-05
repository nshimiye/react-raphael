// jsdom intentionally omits SVG layout APIs. Lifecycle/SVG integration is covered in real browsers.
Object.defineProperty(window, 'SVGAngle', { value: class SVGAngle {} });
