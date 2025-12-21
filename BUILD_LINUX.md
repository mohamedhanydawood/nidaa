# Building Linux AppImage on Windows via WSL

This guide explains how to build the Linux AppImage version of Nidaa on Windows using WSL (Windows Subsystem for Linux).

## Prerequisites

### 1. Install WSL 2
```powershell
# Enable WSL (run as Administrator)
wsl --install

# Or install a specific distro
wsl --install -d Ubuntu-22.04
```

### 2. Install Node.js in WSL using nvm

```bash
# Inside WSL terminal
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or source profile
source ~/.bashrc

# Install Node.js LTS
nvm install --lts

# Verify installation
node --version
npm --version
```

### 3. Install Build Dependencies in WSL

```bash
sudo apt update
sudo apt install -y build-essential squashfs-tools \
    libgtk-3-0 libnss3 libnspr4 libasound2 \
    libxss1 libxtst6 libnotify4 libsecret-1-0 xdg-utils
```

**Critical packages:**
- `build-essential` - gcc, g++, make for native compilation
- `squashfs-tools` - **Provides mksquashfs needed for AppImage creation**
- GUI libraries - Required for Electron runtime

---

## Build Process

### Step 1: Copy Project to WSL Filesystem

**Why?** Windows-created `node_modules` has permission conflicts in WSL. Copying to WSL native filesystem (`~/`) avoids this.

```powershell
# From Windows PowerShell/Terminal
wsl -e bash -lc "mkdir -p ~/nidaa-build && rsync -av --exclude=node_modules --exclude=.next --exclude=dist --exclude=out /mnt/d/nidaa/ ~/nidaa-build/"
```

**What it does:**
- Creates `~/nidaa-build` in WSL home directory
- Copies all source files **except** build artifacts
- Preserves file permissions and structure

---

### Step 2: Install Dependencies

```powershell
# Install npm packages in WSL
wsl -e bash -c "source ~/.nvm/nvm.sh && cd ~/nidaa-build && npm install"
```

**Important:** The `source ~/.nvm/nvm.sh` ensures WSL Node.js (not Windows Node.js) is used.

**Expected output:**
```
added 749 packages, and audited 750 packages in 3m
found 0 vulnerabilities
```

---

### Step 3: Build Next.js Application

```powershell
wsl -e bash -c "source ~/.nvm/nvm.sh && cd ~/nidaa-build && npm run build"
```

**What it does:**
- Compiles Next.js production build
- Compiles TypeScript Electron code to JavaScript
- Creates optimized static assets

**Expected output:**
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (6/6)
```

---

### Step 4: Build AppImage

```powershell
wsl -e bash -c "source ~/.nvm/nvm.sh && cd ~/nidaa-build && npm run dist:linux"
```

**What `dist:linux` does:**
1. Runs `resize-icons` script (creates 256x256 PNG icons)
2. Runs `npm run build` (Next.js + Electron compilation)
3. Runs `electron-builder --linux` (creates AppImage)

**Expected output:**
```
• electron-builder  version=26.0.12
• packaging       platform=linux arch=x64
• building        target=AppImage
```

**Time:** ~2-5 minutes depending on system

---

### Step 5: Verify Build Artifacts

```powershell
wsl -e bash -c "source ~/.nvm/nvm.sh && cd ~/nidaa-build && ls -lh dist/*.AppImage && ls -lh dist/latest*.yml"
```

**Expected files:**
```
-rwxr-xr-x Nidaa-1.0.0.AppImage  (146 MB)
-rw-r--r-- latest-linux.yml      (362 bytes)
```

---

### Step 6: Copy Build to Windows

```powershell
wsl -e bash -c "cp ~/nidaa-build/dist/Nidaa-1.0.0.AppImage /mnt/d/nidaa/dist/ && cp ~/nidaa-build/dist/latest-linux.yml /mnt/d/nidaa/dist/"
```

**Result:** AppImage and `latest-linux.yml` are now in `D:\nidaa\dist\`

---

## Full Build Script (One Command)

### Quick Build (if ~/nidaa-build already exists)
```powershell
wsl -e bash -c "source ~/.nvm/nvm.sh && cd ~/nidaa-build && npm run dist:linux && cp dist/*.AppImage /mnt/d/nidaa/dist/ && cp dist/latest-linux.yml /mnt/d/nidaa/dist/"
```

### Complete Build from Scratch (includes sync + install + build + copy)
```powershell
wsl -e bash -c "mkdir -p ~/nidaa-build && rsync -av --exclude=node_modules --exclude=.next --exclude=dist --exclude=out /mnt/d/nidaa/ ~/nidaa-build/ && source ~/.nvm/nvm.sh && cd ~/nidaa-build && npm install && npm run dist:linux && cp dist/*.AppImage /mnt/d/nidaa/dist/ && cp dist/latest-linux.yml /mnt/d/nidaa/dist/"
```

---

## Troubleshooting

### ❌ Problem: `node: not found`
**Cause:** WSL using Windows Node.js instead of WSL Node.js  
**Solution:** Always prefix commands with `source ~/.nvm/nvm.sh`

---

### ❌ Problem: `mksquashfs: command not found`
**Cause:** `squashfs-tools` not installed  
**Solution:**
```bash
sudo apt install squashfs-tools
```

---

### ❌ Problem: Permission denied on `node_modules`
**Cause:** Using Windows-created `node_modules` in WSL  
**Solution:** Delete and reinstall in WSL:
```bash
rm -rf ~/nidaa-build/node_modules
cd ~/nidaa-build && npm install
```

---

### ❌ Problem: `rsync: command not found`
**Solution:**
```bash
sudo apt install rsync
```

---

## Incremental Builds

After first successful build, you only need to:

```powershell
# 1. Sync changed files
wsl -e bash -c "rsync -av --exclude=node_modules --exclude=.next --exclude=dist /mnt/d/nidaa/ ~/nidaa-build/"

# 2. Build
wsl -e bash -c "source ~/.nvm/nvm.sh && cd ~/nidaa-build && npm run dist:linux"

# 3. Copy back
wsl -e bash -c "cp ~/nidaa-build/dist/*.AppImage /mnt/d/nidaa/dist/ && cp ~/nidaa-build/dist/latest-linux.yml /mnt/d/nidaa/dist/"
```

---

## Testing AppImage in WSL

### Windows 11 (with WSLg)
```bash
cd ~/nidaa-build/dist
chmod +x Nidaa-1.0.0.AppImage
./Nidaa-1.0.0.AppImage
```

### Windows 10 (requires X server)
1. Install [VcXsrv](https://sourceforge.net/projects/vcxsrv/)
2. Launch VcXsrv with "Disable access control"
3. In WSL:
```bash
export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0
cd ~/nidaa-build/dist
./Nidaa-1.0.0.AppImage
```

---

## Clean Build (Fresh Start)

```powershell
# Remove WSL build directory
wsl -e bash -c "rm -rf ~/nidaa-build"

# Start from Step 1
```

---

## Why WSL for Linux Builds?

| Reason | Explanation |
|--------|-------------|
| **mksquashfs** | AppImage creation requires Linux-native `mksquashfs` tool |
| **Native compilation** | electron-builder needs Linux environment for `.so` files |
| **Auto-updates** | AppImage supports delta updates (tar.gz doesn't) |
| **Smaller updates** | Users download 5-20 MB instead of 150 MB |

---

## File Locations Reference

| Location | Purpose |
|----------|---------|
| `/mnt/d/nidaa/` | Windows project directory (original source) |
| `~/nidaa-build/` | WSL build directory (isolated environment) |
| `~/nidaa-build/dist/` | Build output (AppImage + yml) |
| `/mnt/d/nidaa/dist/` | Final artifacts (copied back to Windows) |

---

## Release Checklist

- [ ] Update version in `package.json`
- [ ] Run full build process
- [ ] Verify AppImage size (~146 MB)
- [ ] Check `latest-linux.yml` has correct SHA-512
- [ ] Test AppImage in WSL
- [ ] Upload both files to GitHub Release:
  - `Nidaa-x.x.x.AppImage`
  - `latest-linux.yml`

---

**Built with 💙 for the Nidaa project**
