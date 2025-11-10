# 👾 XOver - Ultimate Tic-Tac-Toe

<div align="center">
  <img src="public/logo_2.svg" alt="XOver Logo" width="120"> <br/><br/>
  
  **A strategic, brain-teasing implementation of Ultimate Tic-Tac-Toe with both local and real-time online multiplayer support, featuring a beautiful glassmorphic dark UI.**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.0-000000.svg)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4.svg)](https://tailwindcss.com/)
  [![WebRTC](https://img.shields.io/badge/WebRTC-P2P-FF6B6B.svg)](https://webrtc.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

---

## ✨ Key Features

- **🎮 Ultimate Tic-Tac-Toe Rules** - Strategic gameplay where each move determines where your opponent plays next
- **👥 Local Multiplayer** - Play against a friend on the same device with hot-seat gameplay
- **🌐 Online Multiplayer** - Real-time P2P gameplay using WebRTC technology
- **🎲 Random Player Assignment** - Fair 50/50 chance for both players regardless of host status
- **⏮️ Undo System** - Take back your last move in local mode (one undo per turn)
- **🏆 Win Announcements** - Elegant modal dialogs celebrating the winner
- **📋 Session Code Sharing** - Easy copy-to-clipboard for inviting friends
- **🔌 Connection Status** - Live connection monitoring with visual indicators
- **📱 Responsive Design** - Optimized for desktop and tablet gameplay
- **♿ Accessibility** - ARIA labels and keyboard navigation support

## 🏗️ Architecture

### Modular Component Structure (Post-Refactoring)

The codebase follows a clean, modular architecture with separated concerns for maximum maintainability:

```
xover/
├── 📁 public/
│
├── 📁 src/
│   ├── 📁 components/
│   │
│   ├── 📁 features/
│   │   ├── game.tsx                        # 🎮 Main game orchestrator (~230 lines)
│   │   ├── microgrid.tsx                   # 🎯 3×3 sub-board component
│   │   ├── ui.tsx                          # 🎨 Shared UI primitives
│   │   ├── signaling.ts                    # 📡 WebRTC signaling utilities
│   │   │
│   │   └── 📁 game/                        # 🧩 Game component modules
│   │       ├── index.ts                    #    📦 Barrel exports
│   │       ├── BackgroundEffects.tsx       #    🌌 Visual effects (~30 lines)
│   │       ├── GameHeader.tsx              #    📋 App header (~10 lines)
│   │       ├── ErrorAlert.tsx              #    ⚠️ Error display (~15 lines)
│   │       ├── TurnIndicator.tsx           #    👤 Turn display (~50 lines)
│   │       ├── GameBoard.tsx               #    🎯 Grid container (~50 lines)
│   │       ├── GameControls.tsx            #    🎮 Action buttons (~45 lines)
│   │       ├── ConnectionPanel.tsx         #    🔌 Online status (~90 lines)
│   │       ├── WinModal.tsx                #    🏆 Win dialog (~65 lines)
│   │       ├── ExitConfirmModal.tsx        #    🚪 Resign dialog (~35 lines)
│   │       ├── useWebRTC.ts                #    🔗 WebRTC hook (~230 lines)
│   │
│   ├── 📁 lib/
│   │   ├── rules.ts                        # 📜 Game logic engine
│   │   └── utils.ts                        # 🔧 Utility functions
│   │
│   ├── 📁 pages/
│   │   ├── _app.tsx                        # 🚀 Next.js app wrapper
│   │   ├── _document.tsx                   # 📄 HTML document structure
│   │   ├── index.tsx                       # 🏠 Main menu & routing
│   │   └── 📁 api/
│   │       └── 📁 signaling/
│   │           └── [session].ts            # 📡 Signaling API endpoint
│   │
│   ├── 📁 styles/
│   │   └── globals.css                     # 🎨 Global styles & Tailwind
│   │
│   └── 📁 types/
│       └── css.d.ts                        # 📝 CSS module declarations
│
├── 📁 tests/
│   └── rules.test.ts                       # 🧪 Game logic tests
|
├── package.json                            # 📦 Dependencies
└── README.md                               # 📖 Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or 20+
- **npm/yarn/pnpm**

### 1. Clone & Setup

```bash
# Clone the repository
git clone https://github.com/BhumikaNair/XOver
cd XOver

# Install dependencies
npm install
```

### 2. Start Development Server

```bash
# Start the Next.js development server
npm run dev
```

### 3. Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Routes**: [http://localhost:3000/api](http://localhost:3000/api)

### 4. Build for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### 5. Run Tests

```bash
# Run Jest unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🎮 How to Play

### Game Rules

**Ultimate Tic-Tac-Toe** is a strategic variant where the board consists of 9 regular tic-tac-toe boards (called micro-boards) arranged in a 3×3 grid.

1. **First Move**: Player X starts by playing in any cell of any micro-board
2. **Subsequent Moves**: Where you play determines which micro-board your opponent must play in
   - If you play in the top-right cell of a micro-board, your opponent must play somewhere in the top-right micro-board
3. **Free Choice**: If you're sent to a micro-board that's already won or full, you can play in any available micro-board
4. **Winning a Micro-board**: Win 3 cells in a row (horizontal, vertical, or diagonal) within a micro-board to claim it
5. **Winning the Game**: Win 3 micro-boards in a row to win the entire game
6. **Draw**: If all 9 micro-boards are completed with no winner, the game is a draw

### Local Mode

- Play against a friend on the same device
- Use the **Undo** button to take back your last move (once per turn)
- Click **New Game** to restart
- Click **Exit** to return to the main menu

### Online Mode

1. **Create a Game**:

   - Click "Play Online"
   - Share your 6-character session code with a friend
   - Wait for them to join

2. **Join a Game**:

   - Click "Join Online"
   - Enter your friend's session code
   - Click Join to start playing

3. **During Online Play**:
   - Connection status is shown in the bottom-left panel
   - Your player assignment (X or O) is displayed
   - Session code is available for easy copying
   - Click **Exit** to resign and return to menu

## 🛠️ Tech Stack

### Frontend

- **⚛️ React 18** - Modern UI library with hooks and concurrent features
- **⚡ Next.js 14** - React framework with SSR, API routes, and file-based routing
- **📘 TypeScript 5** - Type-safe development with strong typing
- **🎨 Tailwind CSS 3** - Utility-first CSS framework for custom styling
- **🎭 Framer Motion** - Smooth animations and transitions

### Backend & Networking

- **🔗 WebRTC** - Peer-to-peer real-time communication
- **📡 Custom Signaling Server** - Built with Next.js API routes
- **🔄 Long Polling** - Signaling message exchange mechanism

### Development Tools

- **🧪 Jest** - JavaScript testing framework
- **🧹 ESLint** - Code linting and formatting
- **🔍 TypeScript Compiler** - Type checking and compilation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with 💙 for strategic minds and competitive spirits**

[🌟 Star this repo](../../stargazers) • [🐛 Report Bug](../../issues) • [💡 Request Feature](../../issues)

Made by [Bhumika Nair](https://github.com/BhumikaNair)

</div>
