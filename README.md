# Fantasy Football Central 🏈

A centralized fantasy football team management application that connects to multiple platforms (ESPN, Yahoo, Sleeper, CBS) and provides a unified dashboard for managing all your teams.

## ✨ Features

- **Multi-Platform Support**: Connect to ESPN, Yahoo, Sleeper, and CBS Fantasy leagues
- **Dynamic Grid Dashboard**: Teams as rows, positions as columns - adapts to any league format
- **Real-Time Sync**: Pull actual lineup data, player stats, and injury status
- **Unified Management**: View and manage all your fantasy teams in one place
- **Professional UI**: Modern, responsive design with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fantasy-football-central
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   npm ci  # for faster, reliable installs
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🛠️ Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Check code quality
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - Check TypeScript types
- `npm run clean` - Clean install (removes node_modules and reinstalls)
- `npm run ci` - Install dependencies for CI/production
- `npm run audit` - Check for security vulnerabilities
- `npm run audit:fix` - Fix security vulnerabilities

## 🔗 Platform Connections

### ESPN Fantasy
- Requires League ID and Team ID
- Go to your ESPN league → Copy League ID from URL
- Find Team ID in league settings

### Yahoo Fantasy
- Requires OAuth setup
- Need to create Yahoo Developer App
- Uses OAuth 2.0 authentication flow

### Sleeper
- No authentication required (public API)
- Just need League ID and Team ID
- Easiest platform to connect

### CBS Sports
- Coming soon
- Manual setup required for now

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard with grid view
│   ├── Settings.tsx     # Platform connections & settings
│   ├── Layout.tsx       # App layout with navigation
│   └── ApiConnection.tsx # Platform connection modal
├── services/            # API integrations
│   ├── espnApi.ts       # ESPN Fantasy API
│   ├── yahooApi.ts      # Yahoo Fantasy API
│   ├── sleeperApi.ts    # Sleeper API
│   └── unifiedApi.ts    # Unified API service
├── store/               # State management
│   └── useStore.ts      # Zustand store
├── types/               # TypeScript type definitions
│   └── index.ts         # Core types
└── App.tsx              # Main app component
```

## 🎯 Usage

1. **Connect Platforms**: Go to Settings → Platform Connections
2. **Add Teams**: Follow platform-specific setup instructions
3. **View Dashboard**: See all teams in unified grid format
4. **Sync Data**: Click sync to pull latest lineup data
5. **Manage Teams**: View player stats, injury status, and projected points

## 🔧 Development

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (recommended)

### State Management
- Zustand for global state
- React hooks for local state

### Styling
- Tailwind CSS for utility-first styling
- Custom color scheme for fantasy platforms

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the [API Integration Guide](./API_INTEGRATION.md)
2. Review the platform-specific setup instructions
3. Open an issue on GitHub

---

**Happy Fantasy Football Managing!** 🏈✨

