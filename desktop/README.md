# AoE4 Overlay Desktop

Shows the overlay directly over the game, no OBS needed. A transparent, click-through, always-on-top window that loads the hosted overlay.

**Requirement:** run AoE4 in *Windowed* or *Borderless/Fullscreen Windowed* mode (overlays can't draw over exclusive fullscreen).

## Run / build (Windows)
```
cd desktop
npm install
npm start          # run
npm run build      # creates dist/AoE4 Overlay *.exe (portable)
```

## Usage
First launch asks for your AoE4 World profile ID. Shortcuts:
- `Ctrl+Shift+O` hide/show
- `Ctrl+Shift+P` change profile/theme
- `Ctrl+Shift+Q` quit
