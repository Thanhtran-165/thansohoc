# Manual Live Verification Checklist
## Personal Numerology Intelligence System — MVP

**Version:** 1.0
**Date:** 2026-03-16
**Purpose:** Step-by-step guide for non-programmers to verify the MVP locally

---

## Before You Start

### What You Need
- A computer running macOS or Windows
- Your DeepSeek API key (get one at https://platform.deepseek.com)
- Internet connection
- Terminal app (macOS: Terminal, Windows: PowerShell or Command Prompt)

### Time Required
Approximately 30-45 minutes for full verification

---

## Step-by-Step Checklist

### Phase 1: Environment Setup

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 1.1 | Open Terminal app | Terminal window opens | ☐ |
| 1.2 | Navigate to project folder | You see `numerology-app` in the path | ☐ |
| 1.3 | Run `npm install` | Shows packages being installed, no errors | ☐ |
| 1.4 | Wait for installation to complete | Shows "added X packages" and returns to prompt | ☐ |

---

### Phase 2: API Key Setup

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 2.1 | Set environment variable (macOS) | No error message | ☐ |
| | `export DEEPSEEK_API_KEY=your_key_here` | | |
| 2.2 | Set environment variable (Windows) | No error message | ☐ |
| | `$env:DEEPSEEK_API_KEY="your_key_here"` | | |
| 2.3 | Verify key is set | Shows your API key | ☐ |
| | Run: `echo $env:DEEPSEEK_API_KEY` (macOS) | | |
| | Run: `echo $env:DEEPSEEK_API_KEY` (Windows PowerShell) | | |

**Note:** Replace `your_key_here` with your actual DeepSeek API key. Keep it secret!

**Note:** On Windows PowerShell, use `$env:DEEPSEEK_API_KEY="sk-xxxx..."` (with quotes around the key)

**Note:** On macOS use `export DEEPSEEK_API_KEY=sk-xxxx...` (no quotes needed unless key has special characters)

---

### Phase 3: App Launch

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 3.1 | Start the app | Terminal shows "Local: http://localhost:5173" | ☐ |
| | Run: `npm run tauri dev` | | |
| 3.2 | Wait for app window to open | A desktop window opens with the app | ☐ |
| 3.3 | Check for errors in terminal | No red error messages in terminal | ☐ |

---

### Phase 4: Onboarding

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 4.1 | See welcome screen | Shows "Welcome" message and "Get Started" button | ☐ |
| 4.2 | Click "Get Started" | Shows form for name and date of birth | ☐ |
| 4.3 | Enter your full name | Name appears in the field | ☐ |
| 4.4 | Enter your date of birth | Date picker shows your DOB | ☐ |
| 4.5 | Click Continue | Shows style preference options | ☐ |
| 4.6 | Select a style preference | Your choice is highlighted | ☐ |
| 4.7 | Click Continue | Shows notification preferences (may skip) | ☐ |
| 4.8 | Complete onboarding | You see the Dashboard with your insight | ☐ |
| 4.9 | Check time taken | Should complete in under 5 minutes | ☐ |

---

### Phase 5: Numerology Profile Verification

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 5.1 | Click on Profile in sidebar | Profile page opens | ☐ |
| 5.2 | Check Life Path number | Shows your calculated Life Path number | ☐ |
| 5.3 | Check Destiny number | Shows your calculated Destiny number | ☐ |
| 5.4 | Check Soul Urge number | Shows your calculated Soul Urge number | ☐ |
| 5.5 | Check Personality number | Shows your calculated Personality number | ☐ |
| 5.6 | Check Birthday number | Shows your calculated Birthday number | ☐ |
| 5.7 | Verify calculation | Numbers match what you'd calculate manually | ☐ |

**Note:** You can verify your Life Path by adding all digits of your birth date. For example
 Jan 15, 1990 = 1+1+5+1+9+9+0 = 26 = 2+6 = 8

---

### Phase 6: Live Insight Generation

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 6.1 | Go to Dashboard | Shows today's insight | ☐ |
| 6.2 | Check for [Calculated] claim | You see "[Calculated] Today is Personal Day X" | ☐ |
| 6.3 | Check for [Interpreted] claim | You see "[Interpreted]" with tentative language | ☐ |
| 6.4 | Check insight is NOT fallback | No "Fallback" badge visible | ☐ |
| 6.5 | Check Personal Day number | Shows today's Personal Day (1-9, 11, or 22) | ☐ |
| 6.6 | Check Personal Month | Shows current Personal Month | ☐ |
| 6.7 | Check Personal Year | Shows current Personal Year | ☐ |

**Note:** If you see a "Fallback" badge, the insight was generated from the template, not the live LLM. This means:
- The API key may not be set correctly
- The API request failed
- Check terminal for error messages

---

### Phase 7: Why-This-Insight Modal

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 7.1 | Find "Why This Insight?" button | Button is visible near the insight | ☐ |
| 7.2 | Click the button | Modal opens with explanation | ☐ |
| 7.3 | Check for calculation formula | Shows how Personal Day was calculated | ☐ |
| 7.4 | Check for confidence breakdown | Shows confidence scores | ☐ |
| 7.5 | Press Escape key | Modal closes | ☐ |
| 7.6 | Press Tab key | Focus moves through modal elements only | ☐ |
| 7.7 | Click outside modal | Modal closes | ☐ |

---

### Phase 8: Feedback Submission

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 8.1 | Find star rating buttons | Shows 5 stars below insight | ☐ |
| 8.2 | Click on a star (e.g., 4 stars) | Stars fill up to your selection | ☐ |
| 8.3 | Check for additional options | May show expanded feedback form | ☐ |
| 8.4 | Submit feedback | Shows "Thank you" or success message | ☐ |
| 8.5 | Verify feedback saved | Reload page - feedback should persist | ☐ |

---

### Phase 9: Journal Save/Load

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 9.1 | Find Journal section | Shows mood and energy sliders | ☐ |
| 9.2 | Adjust mood slider | Slider moves, score updates (1-10) | ☐ |
| 9.3 | Adjust energy slider | Slider moves, score updates (1-10) | ☐ |
| 9.4 | Select emotion tags | Tags highlight when selected | ☐ |
| 9.5 | Add reflection text (optional) | Text appears in text area | ☐ |
| 9.6 | Click Save | Shows success message | ☐ |
| 9.7 | Reload the page | Journal entry loads with your saved values | ☐ |
| 9.8 | Modify and save again | Changes persist | ☐ |

---

### Phase 10: Cached Fallback Path

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 10.1 | Make note of current insight | Remember the headline and content | ☐ |
| 10.2 | Change system date to tomorrow | (Requires dev mode - skip if not possible) | ☐ |
| 10.3 | Restart app | New insight loads | ☐ |
| 10.4 | Check for fallback badge | May show fallback if API unavailable | ☐ |
| 10.5 | Check terminal for fallback log | Shows "fallback" message if used | ☐ |

**Note:** Testing cached fallback is difficult without modifying system date. Skip if not possible for your setup.

 The main thing to verify is that the fallback system exists in code

---

### Phase 11: Generic Fallback Path

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 11.1 | Disconnect internet | Turn off WiFi or unplug ethernet | ☐ |
| 11.2 | Restart app | App still loads | ☐ |
| 11.3 | Check for insight | Shows insight even without internet | ☐ |
| 11.4 | Look for fallback indicator | Shows "Fallback" badge or similar | ☐ |
| 11.5 | Check insight content | Shows generic Personal Day theme | ☐ |
| 11.6 | Reconnect internet | Internet works again | ☐ |
| 11.7 | Restart app | Fresh insight loads (may still be fallback) | ☐ |

---

### Phase 12: Accessibility Quick Checks

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 12.1 | Press Tab key repeatedly | Focus moves through all interactive elements | ☐ |
| 12.2 | Look for "Skip to content" link | Link appears at top-left when focused | ☐ |
| 12.3 | Open modal, press Tab | Focus stays inside modal | ☐ |
| 12.4 | Press Escape in modal | Modal closes | ☐ |
| 12.5 | Use keyboard only | Can navigate to all interactive elements | ☐ |

---

### Phase 13: Data Persistence

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 13.1 | Close the app completely | Window closes | ☐ |
| 13.2 | Reopen the app | All your data is still there | ☐ |
| 13.3 | Check profile | Profile data persists | ☐ |
| 13.4 | Check journal | Today's journal entry persists | ☐ |
| 13.5 | Check insight | Today's insight is still available | ☐ |

---

## Platform-Specific Notes

### macOS
- Terminal app is in Applications > Utilities > Terminal
- If `npm install` fails
 try running `xcode-select --install` first
- If Tauri won't start
 check that Xcode Command Line Tools is installed
- If you get permission errors, check System Preferences > Security & Privacy

### Windows
- Use PowerShell (right-click Start > Windows PowerShell)
- If `npm` is not found
 install Node.js from https://nodejs.org
- If you get execution policy errors, run PowerShell as Administrator
- If Tauri fails to start
 ensure Visual Studio Build Tools are installed

---

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| "npm not found" | Install Node.js from nodejs.org |
| "EACCES" or permission denied | Run terminal as administrator (Windows) or check folder permissions (macOS) |
| "API error 401" | Check your API key is set correctly |
| "Network request failed" | Check internet connection |
| App won't start | Check terminal for error messages, run `npm install` again |
| Insight shows "Fallback" | API key may not be set. Set the environment variable again. |

---

## Final Checklist Summary

| Phase | Status | Blocker? |
|-------|--------|----------|
| 1. Environment Setup | ☐ Pass / ☐ Fail | |
| 2. API Key Setup | ☐ Pass / ☐ Fail | |
| 3. App Launch | ☐ Pass / ☐ Fail | |
| 4. Onboarding | ☐ Pass / ☐ Fail | |
| 5. Profile Verification | ☐ Pass / ☐ Fail | |
| 6. Live Insight | ☐ Pass / ☐ Fail | |
| 7. Why-This-Insight | ☐ Pass / ☐ Fail | |
| 8. Feedback | ☐ Pass / ☐ Fail | |
| 9. Journal | ☐ Pass / ☐ Fail | |
| 10. Cached Fallback | ☐ Pass / ☐ Fail / N/A | |
| 11. Generic Fallback | ☐ Pass / ☐ Fail | |
| 12. Accessibility | ☐ Pass / ☐ Fail | |
| 13. Data Persistence | ☐ Pass / ☐ Fail | |

---

## Final Verdict

**Circle one:**
- [ ] READY FOR PRIVATE BETA
- [ ] READY FOR LAUNCH
- [ ] NOT READY FOR LAUNCH

**Blockers Found:**
(List any issues that prevent launch)

---

**Tester:** ________________
**Date:** ________________
**Platform:** ________________
