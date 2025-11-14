# Next.js + Electron Starter
<img width="1785" height="946" alt="Cover" src="https://github.com/user-attachments/assets/2e1d10a1-78f8-49b5-96e2-3f98616b57ed" />
A modern desktop application starter template combining [Next.js](https://nextjs.org) with [Electron](https://www.electronjs.org/). Build cross-platform desktop apps using React and the latest web technologies.

## Features

- ⚡️ **Next.js 16** - React framework with App Router
- 🖥️ **Electron 39** - Build cross-platform desktop apps
- 📦 **TypeScript** - Fully typed codebase
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔥 **Hot Reload** - Live reload in development for both renderer and main process
- 📦 **Easy Distribution** - Build executables for Windows, macOS, and Linux

## Project Structure

```
nextjs-electron-starter/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── electron/            # Electron source files
│   ├── main.ts         # Electron main process
│   ├── preload.ts      # Preload script
│   └── tsconfig.json   # TypeScript config for Electron
├── build-electron/      # Compiled Electron files (auto-generated)
├── public/             # Static assets
└── out/                # Next.js production build (auto-generated)
```

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd nextjs-electron-starter
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

## Development

### Running the Development Server

Start the development environment with hot reload:

```bash
npm run dev
```

This command will:
1. Start the Next.js development server on `http://localhost:3000`
2. Compile TypeScript files in watch mode
3. Launch the Electron window automatically
4. Enable hot reload for both renderer (Next.js) and main process (Electron)

The Electron window will open automatically once the Next.js dev server is ready. Any changes you make to:
- **Next.js pages** (`app/*`) - Auto-refresh in the Electron window
- **Electron main process** (`electron/main.ts`) - Requires manual restart of the app
- **Preload script** (`electron/preload.ts`) - Requires manual restart of the app

### Development Tips

- Edit `app/page.tsx` to modify the home page
- Edit `electron/main.ts` to customize the Electron window or add native features
- Edit `electron/preload.ts` to expose Node.js APIs safely to the renderer process
- The app automatically connects to `http://localhost:3000` in development mode

## Building for Production

### Build the Application

Create a production build of your app:

```bash
npm run build
```

This command will:
1. Build the Next.js app for production (static export)
2. Compile TypeScript files in the `electron/` directory
3. Output files to the `out/` directory (Next.js) and `build-electron/` (Electron)

### Test Production Build

Run the production build locally before creating distributables:

```bash
npm start
```

This launches Electron with the production build of your Next.js app.

### Create Distributable Packages

Build platform-specific executables and installers:

```bash
npm run dist
```

This will:
- Build the application for production
- Create executable files (.exe for Windows, .dmg for macOS, .AppImage for Linux)
- Generate installers in the `dist/` directory

#### Output Files

After running `npm run dist`, you'll find the following in the `dist/` directory:

**Windows:**
- `nextjs-electron-starter Setup X.X.X.exe` - Installer
- Unpacked application folder

**macOS:**
- `nextjs-electron-starter-X.X.X.dmg` - DMG installer
- `nextjs-electron-starter-X.X.X-mac.zip` - Zipped app

**Linux:**
- `nextjs-electron-starter-X.X.X.AppImage` - AppImage
- `.deb` and `.rpm` packages (if configured)

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build Next.js and Electron for production |
| `npm start` | Run the production build locally |
| `npm run dist` | Create distributable packages (.exe, .dmg, etc.) |
| `npm run lint` | Run ESLint to check code quality |

## Configuration

### Electron Configuration

Edit `electron/main.ts` to customize:
- Window size and properties
- Menu bar and tray icons
- IPC communication
- Native features

### electron-builder Configuration

Add configuration to `package.json` to customize the build:

```json
"build": {
  "appId": "com.yourcompany.yourapp",
  "productName": "Your App Name",
  "directories": {
    "output": "dist"
  },
  "files": [
    "build-electron/**/*",
    "out/**/*"
  ],
  "win": {
    "target": "nsis",
    "icon": "public/icon.ico"
  },
  "mac": {
    "target": "dmg",
    "icon": "public/icon.icns"
  },
  "linux": {
    "target": "AppImage",
    "icon": "public/icon.png"
  }
}
```

## Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [Next.js GitHub](https://github.com/vercel/next.js)

### Electron Resources
- [Electron Documentation](https://www.electronjs.org/docs/latest) - Official Electron docs
- [Electron Builder](https://www.electron.build/) - Distribution package builder
- [Electron Forge](https://www.electronforge.io/) - Alternative build tool

## Clean Build

### Files/Folders to Delete Before a Second Build

To ensure a clean build, delete the following generated folders before running `npm run dist` again:

```bash
# PowerShell (Windows)
Remove-Item -Path "dist",".next","out","build-electron" -Recurse -Force -ErrorAction SilentlyContinue

# Bash (macOS/Linux)
rm -rf dist .next out build-electron
```

| Folder/File | Purpose | Action |
|-------------|---------|--------|
| `dist/` | Final executables & installers | **Delete before rebuild** |
| `.next/` | Next.js build cache | **Delete before rebuild** |
| `out/` | Next.js static export | **Delete before rebuild** |
| `build-electron/` | Compiled Electron TypeScript files | **Delete before rebuild** |
| `node_modules/` | Dependencies | **Keep** (only delete if reinstalling) |

**Note:** The build process will automatically regenerate these folders, so it's safe to delete them.

## Troubleshooting

### Electron window doesn't open
- Make sure the Next.js dev server is running on port 3000
- Check if `NODE_ENV=development` is set in the electron-dev script
- Clear the `build-electron/` folder and restart

### Build errors
- Delete `node_modules/` and reinstall: `npm install`
- Clear Next.js cache: `rm -rf .next`
- Clear all build artifacts: `rm -rf dist .next out build-electron`
- Ensure TypeScript compiles without errors: `tsc -p electron/tsconfig.json`

### Port 3000 already in use
- Stop other processes using port 3000
- Or modify the port in `next.config.ts` and `electron/main.ts`

### Windows symlink errors during build
- The build may show warnings about symlinks, but these can be safely ignored
- The executables will still be created successfully in the `dist/` folder

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
