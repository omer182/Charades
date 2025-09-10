# Charades Game 🎭

A modern, interactive **Charades Game** built with React 19 and Material-UI. Features team management, customizable timers, theme switching, and a beautiful glassmorphism UI design.

## ✨ Features

### 🎮 Game Features
- **Multi-Team Support**: Up to 6 teams with unique colors and names
- **Smart Scoring**: Real-time score tracking with manual adjustment
- **Dynamic Timer**: Configurable timer (30-180 seconds) with visual progress indicators
- **Round System**: Configurable rounds (2-10) with automatic progression
- **Image Navigation**: Previous/next image controls with undo functionality
- **Victory Detection**: Automatic game-over detection with winner announcement
- **Sound Effects**: Dramatic buzzer sound when rounds end
- **Game Persistence**: localStorage saves game state across browser refreshes

### 🎨 Modern UI Design
- **Light/Dark Theme**: Complete theme switching functionality
- **Glassmorphism**: Translucent cards with backdrop blur effects
- **Gradient Design**: Beautiful linear gradients throughout the interface
- **Responsive Layout**: Adapts to different screen sizes
- **Smooth Animations**: CSS transitions and Material-UI animations
- **Fixed Top Bar**: Gradient bar with game name and settings button

### 🛠️ Technical Features
- **React 19**: Modern React with concurrent rendering
- **Material-UI 6.4.2**: Component library for modern UI design
- **Theme Context**: Custom React Context for theme management
- **localStorage Integration**: Automatic game state persistence
- **Docker Support**: Production-ready containerization
- **Image Processing**: Automated image processing with text overlays

## 🚀 Quick Start

### Local Development
```bash
npm install
npm run dev
```
- Runs on `http://localhost:3000`
- Uses nodemon for hot reloading
- Features live theme switching and responsive design

### Production Build
```bash
npm run build
npm install -g serve
serve -s build
```

### Docker Deployment
```bash
docker build -t charades-game .
docker run -p 3000:3000 charades-game
```

## 🖼️ Adding Custom Images

### 1. Add Raw Images
Place your images in the `pictures/raw/` directory. Hebrew filenames are supported.

### 2. Process Images
Run the image processing script:
```bash
cd scripts
node addTextToImage.js
```

### 3. What the Script Does
- Enlarges images by 50%
- Adds a semi-transparent black overlay at the bottom
- Overlays the filename as white text
- Outputs processed images to `pictures/result/`

## 🎯 How to Play

### 1. Team Setup
- Add 1-6 teams with auto-assigned unique colors
- Teams are automatically managed with color coding

### 2. Configuration
- Open settings modal to configure:
  - Number of rounds (2-10)
  - Timer duration (30-180 seconds in 30s steps)
  - Theme preference (light/dark)

### 3. Gameplay
- Teams take turns guessing based on displayed images
- Use ✓ for correct guesses, ✗ for skips/incorrect
- Timer automatically advances to next team/round
- Visual feedback with progress bars and status indicators
- Dramatic sound plays when round ends

### 4. Scoring & Victory
- Real-time score tracking with manual adjustment
- Automatic winner detection with celebration modal
- Game state persists across browser refreshes

## 🏗️ Technical Architecture

### Tech Stack
- **React 19.0.0** - Modern React with concurrent rendering
- **Material-UI 6.4.2** - Component library and theming
- **Sharp 0.34.2** - High-performance image processing
- **Create React App 5.0.1** - Build toolchain
- **Node.js 20** - Runtime environment

### Key Components
- **ModernCard**: Custom wrapper with glassmorphism effects
- **TeamsManager**: Team management with animations
- **Timer**: Decoupled timer with progress indicators
- **Modal**: Dual-modal system for transitions and standings
- **Theme Provider**: Context-based theme management

### Data Management
- **No Database**: Client-side only application
- **localStorage**: Persistent game state across sessions
- **React State**: Component-based state management
- **Dynamic Imports**: Automatic image discovery

## 📁 Project Structure

```
charades-game/
├── public/                    # Static assets
│   ├── round-end-dramatic.mp3 # Sound effects
│   └── eye-face.png          # Game logo
├── src/
│   ├── index.js              # App entry point
│   ├── index.css             # Global styles
│   ├── UI/
│   │   ├── Charade.jsx       # Main game component
│   │   └── Components/       # Reusable components
│   │       ├── Modal/        # Game modals
│   │       ├── TeamsManager/ # Team management
│   │       └── Timer/        # Timer component
│   └── assets/               # App assets
├── pictures/
│   ├── raw/                  # Original images
│   └── result/               # Processed images
├── scripts/
│   └── addTextToImage.js     # Image processing
├── docs/
│   └── overview.md           # Detailed documentation
├── Dockerfile                # Production deployment
└── package.json              # Project configuration
```

## 🔧 Available Scripts

- `npm run dev` - Development server with nodemon
- `npm start` - Development server (CRA default)
- `npm run build` - Production build
- `npm test` - Run tests

## 🌟 Recent Improvements

- **localStorage Integration**: Game state persists across browser refreshes
- **Sound System**: Dramatic round-end sound effects
- **Enhanced Timer Settings**: 30-180 second range with 30-second steps
- **Improved Team Visibility**: Better contrast for team names
- **Dual-Modal Layout**: Separate team standings and transition modals
- **Timer Decoupling**: Fixed timer freezing issues
- **Responsive Design**: Better mobile and desktop layouts

## 🤝 Contributing

Feel free to contribute by:
- Adding new features and components
- Improving the UI/UX design
- Optimizing performance
- Adding tests
- Enhancing documentation

Pull requests are always welcome! 🎉

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy the game, and may the best team win!** 🏆

*Created by Omer S.*
