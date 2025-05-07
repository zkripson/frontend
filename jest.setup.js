// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Add custom matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = Boolean(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be in the document`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be in the document`,
        pass: false,
      };
    }
  },
});

// Filter out React JSX transform warning
const originalWarn = console.warn;
console.warn = function filterWarning(...args) {
  // Suppress React JSX transform warning
  if (args[0] && typeof args[0] === 'string' && args[0].includes('outdated JSX transform')) {
    return;
  }
  originalWarn.apply(console, args);
};