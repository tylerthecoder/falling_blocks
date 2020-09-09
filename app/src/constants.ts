export const CONFIG = {
  renderDistance: 4,
  seed: "bungus",

  transparency: true,

  fovFactor: .6,

  glFov: (45 * Math.PI) / 180,

  terrain: {
    jagFactor: 32,
    maxHeight: 10,
    chunkSize: 16,
    // chunkSize: 4,
    cloudLevel: 30,
    // flatWorld: true,
    flatWorld: false,
    trees: true,
    // trees: false,
    flowers: true,
    // flowers: false,
  },

  gravity: -0.009,

  player: {
    speed: .2,
    reach: 10,
    jumpSpeed: 0.14,
    rotSpeed: 0.002,
  }
};

// declare var window;

// if (window)
//   (window as any).config = CONFIG;