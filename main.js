// main.js
// Electron 38 repro: Window Controls Overlay + DevTools dock-right not sticking
// Uses WebContentsView. Press F12 to (re)open DevTools docked-right.

const { app, BrowserWindow, WebContentsView } = require('electron');
const path = require('path');

const OVERLAY_HEIGHT = 36; // keep in sync with overlay/drag strip

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    show: false,
    backgroundColor: '#111111',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#111111',
      symbolColor: '#ffffff',
      height: OVERLAY_HEIGHT
    }
  });

  // Load a tiny overlay (provides a draggable strip) in the window's own webContents
  win.loadFile(path.join(__dirname, 'overlay.html'));

  // Create WebContentsView for app content
  const view = new WebContentsView();
  win.contentView.addChildView(view);

  // Layout content directly below the overlay height
  const relayout = () => {
    const [w, h] = win.getContentSize();
    view.setBounds({ x: 0, y: OVERLAY_HEIGHT, width: w, height: Math.max(0, h - OVERLAY_HEIGHT) });
  };
  win.on('resize', relayout);

  // Load the demo page
  view.webContents.loadFile(path.join(__dirname, 'index.html'));

  // Open DevTools on the right on first load (repro step 1)
  view.webContents.once('did-frame-finish-load', () => {
    try { view.webContents.openDevTools({ mode: 'right' }); } catch {}
    relayout();
  });

  // Press F12 any time to reopen DevTools docked-right
  view.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') {
      try { view.webContents.openDevTools({ mode: 'right' }); } catch {}
      event.preventDefault();
    }
  });

  win.once('ready-to-show', () => {
    win.show();
    relayout();
  });

  return win;
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
