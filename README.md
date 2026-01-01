# نداء - Islamic Prayer Times Desktop App
<img width="1918" height="1050" alt="image" src="https://github.com/user-attachments/assets/90c7b40b-6d44-4c5b-a755-ad79e20aa5f2" />


A modern Islamic prayer times desktop application built with Next.js and Electron. Features real-time prayer notifications, prayer tracking, statistics, and a beautiful Arabic interface.

## ✨ Features

- 🕌 **Accurate Prayer Times** - Real-time calculation using Aladhan API
- 🔔 **Smart Notifications** - Configurable prayer time alerts
- 📊 **Prayer Tracking** - Mark completed prayers and view statistics
- 📅 **Hijri Calendar** - Display Islamic dates alongside Gregorian
- 🌅 **Sunrise Times** - Additional astronomical information
- 📈 **Weekly Heatmap** - Visual prayer completion tracking
- 🎨 **Arabic Interface** - RTL support with beautiful Arabic typography
- 🖥️ **Desktop Integration** - Tray icon, background operation, system notifications
- 🔒 **Secure & Private** - No data collection, local storage only
- 🌙 **Dark Theme** - Modern black/white color scheme

## 📱 How It Works

### Core Functionality
1. **Location-Based Times**: Select your city and country to get accurate prayer times
2. **Real-Time Updates**: Prayer times are calculated daily using astronomical data
3. **Smart Notifications**: Get notified before each prayer with customizable timing
4. **Prayer Tracking**: Mark prayers as completed and track your daily progress
5. **Statistics Dashboard**: View streaks, completion rates, and weekly summaries

### Technical Architecture
- **Frontend**: Next.js 16 with React 19, TypeScript, and Tailwind CSS
- **Backend**: Electron 39 for desktop functionality
- **Storage**: Local electron-store (no cloud sync)
- **API**: Aladhan API for prayer time calculations
- **Security**: Context isolation, CSP headers, input validation

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.x or higher
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mohamedhanydawood/nidaa.git
cd nidaa
```

2. Install dependencies:
```bash
npm install
```

## 🛠️ Development

### Running the Development Server

Start the development environment:

```bash
npm run dev
```

This will:
- Start Next.js dev server on `http://localhost:3000`
- Compile Electron TypeScript files
- Launch the desktop application
- Enable hot reload for UI changes

### Development Workflow

- **UI Changes**: Edit files in `app/` directory - changes auto-refresh
- **Electron Logic**: Edit files in `electron/` directory - requires app restart
- **Settings**: Modify `app/settings/page.tsx` for configuration UI
- **Styling**: Update `app/globals.css` for theme changes

## 📁 Project Structure

```
nidaa/
├── app/                          # Next.js App Router
│   ├── components/              # React Components
│   │   ├── CountdownTimer.tsx   # Prayer countdown display
│   │   ├── PrayerChecklist.tsx  # Prayer marking interface
│   │   └── WeeklyHeatmap.tsx    # Statistics visualization
│   ├── settings/                # Settings page
│   │   └── page.tsx            # Configuration interface
│   ├── globals.css             # Global styles & theme
│   ├── layout.tsx              # Root layout with CSP
│   └── page.tsx                # Main prayer times display
├── electron/                    # Electron main process
│   ├── ipcHandlers.ts          # IPC communication handlers
│   ├── main.ts                 # Application entry point
│   ├── prayerService.ts        # Aladhan API integration
│   ├── scheduler.ts            # Prayer notification scheduler
│   ├── store.ts                # Local data persistence
│   ├── types.ts                # TypeScript definitions
│   ├── validators.ts           # Input validation
│   └── window.ts               # Window & tray management
├── build-electron/             # Compiled Electron files
├── public/                     # Static assets
│   └── icon.ico               # Application icon
└── out/                       # Next.js production build
```

### Codebase Architecture

#### Frontend (`app/`)
- **Modern React**: Uses Next.js 16 App Router with React 19
- **TypeScript**: Fully typed components and hooks
- **Tailwind CSS**: Utility-first styling with custom Arabic theme
- **RTL Support**: Right-to-left layout for Arabic text
- **Responsive Design**: Works on different window sizes

#### Backend (`electron/`)
- **Modular Architecture**: Split into focused modules
- **IPC Communication**: Secure renderer-main process communication
- **Local Storage**: electron-store for settings and prayer records
- **Background Operation**: Tray icon allows app to run minimized
- **Security**: Context isolation and CSP protection

#### Key Components

**Prayer Times Display** (`app/page.tsx`)
- Real-time prayer schedule
- Next prayer highlighting
- Statistics dashboard
- Weekly heatmap visualization

**Settings Management** (`app/settings/page.tsx`)
- Location configuration (country/city)
- Prayer calculation method selection
- Notification preferences
- Time format options

**Prayer Scheduler** (`electron/scheduler.ts`)
- Notification timing logic
- Prayer time calculations
- Background scheduling

**IPC Handlers** (`electron/ipcHandlers.ts`)
- Settings CRUD operations
- Prayer data fetching
- Statistics calculations
- Prayer marking logic

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development with hot reload |
| `npm run build` | Build for production |
| `npm start` | Run production build locally |
| `npm run dist` | Create distributable packages |
| `npm run lint` | Run ESLint code quality checks |

## 🔧 Configuration

### Prayer Calculation Methods

The app supports multiple Islamic prayer time calculation methods:

1. **Egyptian General Authority** (Default)
2. **Islamic Society of North America**
3. **Muslim World League**
4. **Umm Al-Qura, Makkah**
5. **Other regional methods**

### Supported Locations

**Middle East & North Africa:**
- Egypt (Cairo, Alexandria, etc.)
- Saudi Arabia (Riyadh, Mecca, Medina)
- UAE (Dubai, Abu Dhabi)
- Kuwait, Qatar, Bahrain, Oman
- Jordan, Lebanon, Syria, Iraq
- Palestine, Yemen
- Morocco, Algeria, Tunisia, Libya, Sudan

### Notification Settings

- **Pre-prayer Alert**: Configure minutes before prayer (0-60)
- **Madhab Selection**: Hanafi (1) or Shafi (0) for Asr prayer
- **Time Format**: 12-hour or 24-hour display

## 🏗️ Building for Production

### Create Production Build

```bash
npm run build
```

### Test Production Build

```bash
npm start
```

### Create Distributables

```bash
npm run dist
```

**Output:**
- **Windows**: `.exe` installer and portable version
- **macOS**: `.dmg` installer
- **Linux**: `.AppImage` and package formats

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Guidelines

- **TypeScript**: Strict typing required
- **ESLint**: Follow the configured linting rules
- **Commits**: Use conventional commit format
- **Testing**: Test on Windows, macOS, and Linux
- **Security**: No external dependencies without review

### Areas for Contribution

- 🌐 **Localization**: Add more languages
- 🎨 **Themes**: Additional color schemes
- 📱 **Features**: New Islamic features (Qibla, Quran, etc.)
- 🔧 **Performance**: Optimize memory usage
- 🐛 **Bug Fixes**: Report and fix issues
- 📚 **Documentation**: Improve docs and guides

### Reporting Issues

When reporting bugs, please include:
- Operating system and version
- App version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Permissions
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

### Limitations
- ❌ No liability
- ❌ No warranty

### Conditions
- ℹ️ License and copyright notice must be included

## 🧹 Clean Build

Before rebuilding, clean these folders:

```bash
# Windows PowerShell
Remove-Item -Path "dist",".next","out","build-electron" -Recurse -Force

# Linux/macOS
rm -rf dist .next out build-electron
```

## ❓ Troubleshooting

### Common Issues

**App won't start:**
- Ensure Node.js 18+ is installed
- Clear node_modules: `rm -rf node_modules && npm install`

**Prayer times incorrect:**
- Check location settings
- Verify internet connection for API calls
- Try different calculation methods

**Notifications not working:**
- Check system notification permissions
- Verify notification settings in app
- Restart the application

**Build errors:**
- Clear all build artifacts
- Reinstall dependencies
- Check TypeScript compilation: `npx tsc -p electron/tsconfig.json`

### Support

For questions or issues:
1. Check existing GitHub issues
2. Create a new issue with detailed information
3. Include your operating system and app version

---

**Made with ❤️ for the Muslim community**

*May Allah accept our prayers and guide us all to the straight path*
