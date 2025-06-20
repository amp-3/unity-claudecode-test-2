# Omni Shooter

A browser-based omni-directional shooter game built with JavaScript and HTML5 Canvas.

## Project Structure

```
omni-shooter/
├── src/
│   ├── core/          # Core game engine components
│   ├── entities/      # Game entities (player, enemies, projectiles)
│   ├── systems/       # Game systems (physics, collision, input)
│   ├── ui/            # User interface components
│   ├── effects/       # Visual and sound effects
│   ├── utils/         # Utility functions and helpers
│   ├── debug/         # Debug tools and helpers
│   ├── main.js        # Entry point
│   └── game.js        # Main game class
├── assets/
│   ├── sprites/       # Game sprites and images
│   ├── audio/         # Sound effects and music
│   └── fonts/         # Game fonts
├── tests/             # Unit and integration tests
├── dist/              # Build output
├── index.html         # Main HTML file
├── package.json       # Project configuration
└── README.md          # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:
```bash
npm run dev
```

### Building

Build for production:
```bash
npm run build
```

### Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Game Controls

- **Movement**: WASD or Arrow Keys
- **Shoot**: Mouse Click or Space
- **Pause**: Escape or P

## Features

- Omni-directional shooting mechanics
- Enemy wave system
- Power-ups and upgrades
- Score tracking
- Particle effects
- Sound effects and music

## License

MIT