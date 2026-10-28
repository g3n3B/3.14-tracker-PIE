# Clock Tracker

A tracker for progress clocks, counters, and factions, made for tabletop roleplaying games such as *Blades in the Dark*. The Game Master (GM) runs it on their own computer, and players see a separate window with only the things the GM has chosen to show.

It runs in a web browser and works offline. There is nothing to install and no account to make.

---

## Quick start

1. Download or clone this repository.
2. Double-click **`run-clock-tracker.bat`** (Windows). It opens the app in its own window, with no tabs or address bar.
3. Or open **`index.html`** directly in any modern browser.

Your campaign saves automatically in that browser. See [Saving and backups](#saving-and-backups).

---

## What it does

**Clocks**
- Pie-chart clocks with any number of slices.
- **Standard** clocks fill up and finish.
- **Morale** clocks can drop to zero, which triggers a mutiny alert.
- Each clock has its own filled and empty colors.
- Link one clock to another. When a clock finishes, you're asked whether to reveal or start the linked clock. Nothing changes until you say yes.
- Clocks can start **locked** until a link unlocks them.

**Counters**
- A labeled number with plus and minus buttons.
- Optional minimum and maximum. Turn a limit off for no limit on that side.

**Factions**
- Group clocks and counters together under a named faction, with optional notes.

**Everything else**
- Undo and redo (Ctrl+Z and Ctrl+Y).
- Keyboard: click a clock or counter to select it, then press **+** or **-**.
- Select mode for deleting several items at once.
- Session notes, which are saved but never shown to players.
- Five color looks: Parchment, Forest, Galaxy, Sea, and Ember.

---

## The player view

Click **Player view** to open a second window. Share that window on Discord or on screen, and keep the DM window to yourself.

- Players see only **visible** clocks and counters.
- The player window reads its own copy of the campaign. That copy never includes hidden items, factions, links, or notes.
- When a morale clock drops to zero, the player window flashes **MUTINY** full screen.
- In Settings, you can choose whether status labels such as Mutiny, Locked, and Finished show to players.

The two windows only sync when they're open in the same browser on the same computer. Players on their own devices can't see the view yet.

---

## Saving and backups

- **Autosave** is on by default. Your campaign is kept in the browser on this computer.
- Turn autosave off in **Settings** if you'd rather save by hand with **Save now**.
- **Export** downloads the whole campaign as a `.json` file. **Import** loads one back.
- Export after each session. Browser storage can be cleared, and saved data doesn't carry over between browsers.
- Chrome and Firefox keep separate saved data. Pick one browser and stick with it.

---

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole app. Open this to use it. |
| `run-clock-tracker.bat` | Windows launcher that opens the app in its own window. |
| `clock.js` | The clock, counter, and faction rules, kept separate for testing. |
| `clock.test.js` | Automatic tests for those rules. |
| `check-page.js` | Checks that the page's code parses and every element it uses exists. |
| `run-tests.ps1` / `run-tests.bat` | Runs the tests and checks, then opens the manual checklist. |
| `manual-checklist.txt` | Step-by-step checks for clicking through the app. |
| `make-stress-campaign.js` | Makes a large test campaign, to check the app stays responsive. |
| `stress-campaign.json` | The output of that script, ready to import. |
| `security-test.json` | A safe file that tries common attacks. Importing it should do nothing harmful. |

---

## Testing

**Automatic checks** need [Node.js](https://nodejs.org) (LTS version). From the folder:

```
node --test clock.test.js
node check-page.js
```

On Windows you can also double-click `run-tests.bat`.

**Manual checks** are in `manual-checklist.txt`. They cover clicking through the app, the player view, and the security test. Automatic checks can't click buttons, so run the checklist before relying on the app.

---

## Security and privacy

- The app makes no network requests. It loads no outside scripts, fonts, or images.
- Its content security policy allows only the page's own scripts to run.
- Files you import are checked before use. Bad IDs, values, colors, and links are replaced or dropped, and files over 5 MB are refused.
- Saved campaigns are **not encrypted**. Anyone with access to your computer's browser can read them.
- Players with developer tools can read the player window's saved copy. It contains only visible items, but don't rely on it to hide anything from someone determined to look.

---

## Limitations

- Sync between the DM and player windows only works on one computer, in one browser.
- Undo history resets when the page reloads. Export is the real backup.
- Some browsers treat every file opened from your computer as one site, so keep unrelated HTML files out of this folder.

---
