# Local Run Commands
## Personal Numerology Intelligence System — MVP

**Version:** 1.0
**Date:** 2026-03-16
**Purpose:** Exact commands to run the MVP locally

---

## Prerequisites Check

Before running any commands, verify you have:

| Requirement | How to Check | Fix |
|-------------|--------------|-----|
| Node.js installed | Run `node --version` | Download from nodejs.org |
| npm installed | Run `npm --version` | Comes with Node.js |
| Project folder exists | Run `ls` and look for `numerology-app` | You're in wrong folder |

---

## Commands Reference

### 1. Navigate to Project Folder

**macOS:**
```bash
cd "/Users/bobo/Library/Mobile Documents/com~apple~CloudDocs/Thần số học/numerology-app"
```

**Windows (PowerShell):**
```powershell
cd "C:\Users\[YourUsername]\CloudDocs\Thần số học\numerology-app"
```

**Success looks like:**
- Prompt shows path ending in `numerology-app`
- Running `ls` shows files like `package.json`, `src`

---

### 2. Install Dependencies

**Command:**
```bash
npm install
```

**Success looks like:**
```
added 245 packages in 12s

14 packages are looking for funding
  run `npm fund` for details
```

**Common errors:**

| Error | Meaning | Solution |
|-------|---------|----------|
| `npm ERR!` EACCES | Permission denied | Run with `sudo` (macOS) or as Admin (Windows) |
| `npm ERR!` ENOENT | File not found | Make sure you're in `numerology-app` folder |
| `network` errors | No internet | Check your connection |

---

### 3. Set API Key (macOS/Linux)

**Command:**
```bash
export DEEPSEEK_API_KEY=sk-your-key-here
```

**Replace `sk-your-key-here` with your actual API key from https://platform.deepseek.com**

**Success looks like:**
- No error message
- Command runs silently

**Verify it worked:**
```bash
echo $DEEPSEEK_API_KEY
```

**Should show:** Your API key (starting with `sk-`)

---

### 4. Set API Key (Windows PowerShell)

**Command:**
```powershell
$env:DEEPSEEK_API_KEY="sk-your-key-here"
```

**Replace `sk-your-key-here` with your actual API key**

**Success looks like:**
- No error message
- Command runs silently

**Verify it worked:**
```powershell
echo $env:DEEPSEEK_API_KEY
```

**Should show:** Your API key

**Note on Windows:**
- Use quotes around the key: `"sk-xxxxx"`
- This setting only lasts for the current PowerShell session
- If you close PowerShell, you need to set it again

---

### 5. Run Web Preview (Quick Test)

**Command:**
```bash
npm run dev
```

**Success looks like:**
```
  VITE v5.3.4  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Then:**
- Open browser to `http://localhost:5173`
- You should see the app

**Common errors:**

| Error | Meaning | Solution |
|-------|---------|----------|
| `Port 5173 is already in use` | Another app using that port | Run `npx kill-port 5173` first |
| `Module not found` | Dependencies not installed | Run `npm install` again |
| White screen | JavaScript error | Open browser console (F12) for details |

**Important:** Web preview CANNOT use SQLite database. It uses a temporary file instead. For full testing, use Tauri.

---

### 6. Run Tauri App (Full Desktop App)

**Command:**
```bash
npm run tauri dev
```

**Success looks like:**
```
    Running `target/debug/numerology-app`
    Webview created
```

**Then:**
- A desktop window opens automatically
- You see the Numerology app interface

**This takes a while first time:**
- First run compiles Rust code (2-5 minutes)
- Subsequent runs are faster (30-60 seconds)

**Common errors:**

| Error | Meaning | Solution |
|-------|---------|----------|
| `Cargo not found` | Rust not installed | Install Rust from rust-lang.org |
| `xcrun: error` | Xcode tools missing (macOS) | Run `xcode-select --install` |
| `linker 'link.exe' not found` | Build tools missing (Windows) | Install Visual Studio Build Tools |
| API key errors | Key not set or invalid | Check `DEEPSEEK_API_KEY` is set correctly |

---

### 7. Run Tests

**Command:**
```bash
npm run test
```

**Success looks like:**
```
 ✓ src/services/insight/insight.test.ts  (94)
   All tests passed
```

**Common errors:**

| Error | Meaning | Solution |
|-------|---------|----------|
| Tests fail | Code issue | Check the error message for details |
| `No test files found` | Wrong folder | Make sure you're in `numerology-app` |

---

### 8. Check TypeScript Compilation

**Command:**
```bash
npx tsc --noEmit
```

**Success looks like:**
- No output (this means no errors)

**Common errors:**

| Error | Meaning | Solution |
|-------|---------|----------|
| Type errors | Code has type issues | Check the error messages |
| `Command not found` | TypeScript not installed | Run `npm install` |

---

### 9. Build for Production (Optional)

**macOS:**
```bash
npm run tauri build
```

**Success looks like:**
```
    Finished 2 targets in 3m 45s
    Built app at: src-tauri/target/release/bundle/
```

**Output location:**
- macOS: `src-tauri/target/release/bundle/macos/`
- Windows: `src-tauri/target/release/bundle/msi/`

**This takes 5-15 minutes depending on your computer.**

---

## Quick Reference Card

Copy/paste these commands in order:

### macOS Quick Start
```bash
# 1. Navigate to project
cd "/Users/bobo/Library/Mobile Documents/com~apple~CloudDocs/Thần số học/numerology-app"

# 2. Install dependencies
npm install

# 3. Set API key (replace with your actual key)
export DEEPSEEK_API_KEY=sk-your-actual-key-here

# 4. Verify key is set
echo $DEEPSEEK_API_KEY

# 5. Run the app
npm run tauri dev
```

### Windows Quick Start (PowerShell)
```powershell
# 1. Navigate to project
cd "C:\Users\[YourUsername]\CloudDocs\Thần số học\numerology-app"

# 2. Install dependencies
npm install

# 3. Set API key (replace with your actual key)
$env:DEEPSEEK_API_KEY="sk-your-actual-key-here"

# 4. Verify key is set
echo $env:DEEPSEEK_API_KEY

# 5. Run the app
npm run tauri dev
```

---

## Stopping the App

- In terminal: Press `Ctrl+C`
- Or close the app window

---

## Restarting After Changes

1. Stop the app (`Ctrl+C` in terminal)
2. Run `npm run tauri dev` again

**Tip:** Tauri automatically reloads when you change React code. You only need to restart for:
- Changes to Rust code (src-tauri folder)
- Changes to environment variables
- Changes to package.json

---

## Need Help?

| Problem | Check |
|---------|-------|
| App won't start | Terminal error messages |
| Blank screen | Browser console (F12) for web, terminal for Tauri |
| No insight showing | Is `DEEPSEEK_API_KEY` set? |
| Database errors | Check terminal for SQLite messages |
| Slow startup | First run compiles Rust - be patient |

---

*Last Updated: 2026-03-16*
