# Project Overview

## Purpose

This is a **Charades Game** web application built with React that allows players to create teams, set timers, and play an interactive game of charades using custom images. The game displays images with Hebrew text overlays, and players must act out the word/phrase shown in the image for their teammates to guess. The application features a modern, responsive UI with dark/light theme support, a settings modal, and a fixed top bar for branding.

## Key Libraries

- **React 19.0.0** - Core frontend framework using modern React features
- **Material-UI (MUI) 6.4.2** - Component library for modern UI design
  - `@emotion/react` & `@emotion/styled` - CSS-in-JS styling solution
  - `@mui/icons-material` - Icon components
- **Sharp 0.33.5** - High-performance image processing library (for the build script)
- **fs-extra 11.3.0** - Enhanced file system operations
- **Create React App 5.0.1** - Build toolchain and development server
- **nodemon 3.1.10** (dev) - Hot-reloading for development

## File Structure

```
├── public/                    # Static assets and HTML template
├── src/
│   ├── index.js              # Application entry point with React 19 root and theme provider
│   ├── index.css             # Global styles and CSS reset
│   ├── UI/
│   │   ├── Charade.jsx       # Main game component with modern layout and top bar
│   │   ├── Charade.css       # Legacy styles (mostly replaced by MUI theming)
│   │   └── Components/
│   │       ├── Modal/        # Game transition and victory modals
│   │       ├── TeamsManager/ # Team management with color coding
│   │       └── Timer/        # Timer with progress indicators
│   └── assets/               # Logos, QR codes, and app assets
├── pictures/
│   ├── raw/                  # Original images (Hebrew filenames)
│   └── result/               # Processed images with text overlays
├── scripts/
│   └── addTextToImage.js     # Image processing script
├── docs/
│   └── overview.md           # This documentation file
├── Dockerfile                # Production deployment configuration
└── package.json              # Project configuration and scripts
```

## Startup & Runtime

### Local Development
```bash
npm install
npm run dev
```
- Uses **nodemon** to watch for changes and restart the development server
- Runs on `http://localhost:3000`
- Uses Create React App development server with hot reloading
- Features live theme switching, settings modal, and responsive design

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
- Uses Node.js 20 Alpine image optimized for ARM64
- Serves static build with `serve` package

### Key Commands (package.json)
- `npm run dev` - Development server with nodemon
- `npm start` - Development server (CRA default)
- `npm run build` - Production build
- `npm test` - Run tests (CRA default)
- `npm run eject` - Eject from CRA (not recommended)

## Database

**No database is used.** This is a client-side only application that:
- Stores game state in React component state
- Uses local images from the `pictures/result` directory
- All data is ephemeral and resets on page refresh
- Theme preferences are not persisted (resets on page refresh)

## Migrations

Not applicable - no database or persistent storage.

## Testing

- **Framework**: Jest (included with Create React App)
- **Test Runner**: `react-scripts test`
- **Setup**: `src/setupTests.js` - Basic test environment configuration
- **Current Status**: Uses default CRA testing setup, no custom tests implemented

## Environment Variables

- **No custom environment variables** are currently used
- Relies on Create React App's default environment handling
- No `.env` files present in the codebase
- Configuration is handled through static imports and hardcoded values

## API (Swagger/OpenAPI)

No API endpoints or OpenAPI documentation exist. This is a purely frontend application.

## Architecture & Features

### Modern UI Design
- **Top Bar**: Fixed, gradient bar with game name and settings button
- **Settings Modal**: Centralized configuration for rounds, timer, and theme
- **Glassmorphism**: Translucent cards with backdrop blur effects
- **Gradient Design**: Linear gradients throughout the interface
- **Responsive Layout**: Flex/grid-based layout that adapts to different screen sizes
- **Smooth Animations**: CSS transitions and Material-UI animations
- **Hover Effects**: Interactive elements with scale and shadow effects

### Theme System
- **Light/Dark Mode**: Complete theme switching functionality
- **Dynamic Colors**: Theme-aware color schemes for both modes
- **Context-Based**: Uses React Context for theme state management
- **Material-UI Integration**: Custom theme configurations for both modes
- **Gradient Backgrounds**: Different gradient backgrounds for each theme

### Component Architecture
- **ModernCard**: Custom wrapper around MUI Card with glassmorphism effects
- **TeamsManager**: Team management with color coding and animations
- **Timer**: Timer with progress bars, color-coded status, and sound effects
- **Modal**: Game transition modals with round info and last round warning

### Game Features
- **Team Management**: Up to 6 teams with unique colors and names
- **Smart Scoring**: Real-time score tracking with manual adjustment
- **Dynamic Timer**: Configurable timer (30-120 seconds) with visual feedback
- **Round System**: Configurable rounds (2-10) with automatic progression
- **Image Navigation**: Previous/next image controls with undo functionality
- **Victory Detection**: Automatic game-over detection with winner announcement
- **Last Round Warning**: Modal displays a warning when it's the last round for a team

## Processes & Gotchas

### Image Processing Workflow
1. **Add raw images** to `pictures/raw/` directory (Hebrew filenames supported)
2. **Run the processing script**:
   ```bash
   cd scripts
   node addTextToImage.js
   ```
3. **Script automatically**:
   - Enlarges images by 50%
   - Adds a semi-transparent black overlay at the bottom
   - Overlays the filename as white text
   - Outputs processed images to `pictures/result/`

### Game Flow
1. **Team Setup**: Add 1-6 teams with auto-assigned unique colors
2. **Configuration**: Set number of rounds (2-10) and timer duration (30-120 seconds) in the settings modal
3. **Gameplay**: 
   - Teams take turns guessing based on displayed images
   - Use check (✓) for correct guesses, X for skips/incorrect
   - Timer automatically advances to next team/round
   - Visual feedback with progress bars and status indicators
4. **Scoring**: Real-time score tracking with manual adjustment capabilities
5. **Victory**: Automatic winner detection with celebration modal

### Technical Notes
- **React 19 Features**: Uses `ReactDOM.createRoot()` for concurrent rendering
- **Theme Context**: Custom React Context for theme management across components
- **Image Loading**: Dynamic imports using `require.context()` for automatic image discovery
- **State Management**: All state managed in main component, no external state library
- **Responsive Design**: CSS Grid and Material-UI responsive breakpoints
- **Performance**: Optimized with React.memo potential and efficient re-rendering

### UI Considerations
- **Fixed Height Layout**: Uses `100vh` minus top bar and padding to prevent scrolling issues
- **Overflow Management**: Only main game area scrolls if needed
- **Touch-Friendly**: Large touch targets for mobile devices
- **Accessibility**: High contrast themes and proper focus management

## TODOs

### Missing Documentation
- No inline code documentation or JSDoc comments
- Component prop types not defined (could benefit from TypeScript)
- No testing strategy or test cases
- Missing accessibility documentation

### Potential Improvements
- **State Management**: Consider Redux/Zustand for complex state logic
- **TypeScript**: Add type safety for better developer experience
- **Testing**: Add unit tests for game logic and component behavior
- **Accessibility**: Add ARIA labels and keyboard navigation support
- **Performance**: Implement image lazy loading for large picture sets
- **Data Persistence**: Add localStorage to save game progress and theme preferences
- **Internationalization**: Extract Hebrew text to support multiple languages
- **Sound Effects**: Add audio feedback for timer and game events
- **PWA Features**: Add service worker for offline functionality

### Code Quality
- Some legacy CSS in `Charade.css` could be fully migrated to MUI theming
- Magic numbers could be extracted to theme constants
- Error handling could be improved (especially for image loading failures)
- Component splitting: Some components could be further modularized

### Security & Performance
- Image processing script uses dynamic file paths - consider path sanitization
- No input validation on team names or custom timer values
- Consider implementing image optimization for better loading performance
- Bundle size optimization with code splitting

### Known Issues
- Theme preference doesn't persist across page refreshes
- No loading states for image switching
- Timer doesn't pause when browser tab is inactive
- No keyboard shortcuts for game controls 