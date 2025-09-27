# Electron 38 Repro: Window Controls Overlay + DevTools dock-right not sticking

This repo is a minimal **Electron 38** test case using **`WebContentsView`** (replacement for deprecated `BrowserView`) that shows: when the **Window Controls Overlay** (`titleBarOverlay`, i.e., invisible titlebar with native controls) is enabled, **DevTools does not reliably stay docked to the right**.

- ✅ Uses **`WebContentsView`** attached via `win.contentView.addChildView(view)`.
- ✅ The content view is laid out **below** the overlay (36px) so caption buttons are unobstructed.
- ✅ The top strip is **black** and **draggable**
- ✅ Menu actions to **toggle overlay** and **reopen DevTools (Right)** for quick A/B.

## Run

```bash
npm i
npm start
```

## Repro steps

1. DevTools should open with `{ mode: 'right' }`. If not, manually dock to the right.
2. Close DevTools.
3. Press **F12** or use **Repro ▸ Reopen DevTools (Right)**.
4. **Expected:** DevTools remains docked-right.  
   **Actual (bug):** With **Window Controls Overlay** enabled, the dock position often **doesn’t persist** or **won’t stay docked-right**.

## Notes

- There is no public API to *force* a dock side beyond the `{ mode: 'right' }` hint when calling `openDevTools`; Chromium restores prior state and may override. This repro emphasizes the difference in behavior when the overlay is enabled vs. disabled.
- The overlay reserves a region where DOM cannot accept events; we avoid overlap by pushing our content view down by **36px** and using a fixed `-webkit-app-region: drag` element matching the overlay height.

## References

- **WebContentsView API** — add/size views; access `view.webContents`.  
- **Custom Title Bar / `titleBarOverlay` tutorial** — overlay semantics and event exclusion.  
- **Migration blog** — BrowserView → WebContentsView.  
- **BrowserView docs (deprecated)** — status and replacement.

Citations are included when you file the GitHub issue.

