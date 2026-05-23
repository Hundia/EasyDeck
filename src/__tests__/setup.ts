import '@testing-library/jest-dom'

// Polyfill ResizeObserver for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

HTMLCanvasElement.prototype.getContext = ((() => ({
  clearRect: () => {},
  drawImage: () => {},
})) as unknown) as typeof HTMLCanvasElement.prototype.getContext;
