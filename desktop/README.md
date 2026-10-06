# AoE4 Overlay Desktop

Shows the overlay directly over the game, no OBS needed. A transparent, click-through, always-on-top window that loads the hosted overlay.

**Requirement:** run AoE4 in *Windowed* or *Borderless/Fullscreen Windowed* mode (overlays can't draw over exclusive fullscreen).

## Run / build (Windows)
```
cd desktop
npm install
cd .. && npm install && npm run build && cd desktop   # build the overlay web app once (and after pulling updates)
npm start          # run
npm run build      # builds web + creates dist/AoE4 Overlay *.exe (portable)
```

## Usage
First launch asks for your AoE4 World profile ID. Shortcuts:
- `Ctrl+Shift+O` hide/show
- `Ctrl+Shift+P` change profile/theme
- `Ctrl+Shift+Q` quit

## Settings
Pick which stats to show per player (country, rank, rating, win rate, wins/losses, games, max rating, streak) in the settings window (`Ctrl+Shift+P`). The web overlay also accepts them as `?show=country,rank,rating,winrate`.

## Preview, size and autostart
The settings window shows a live preview with a sample game, a size slider (60%–160%) and a "Start with Windows" option.

## Get the .exe without building locally
GitHub > Actions > "Build desktop .exe" > latest run > download the `AoE4-Overlay-exe` artifact (portable, just double-click).
