# Café Terrasse Studio · Night Workshops

An interactive, browser-based art prototype built with JavaScript, Three.js, HTML, and CSS. Explore a small 3D street, accept a guest's nighttime commission, and shape a personal nightscape through three hands-on workshops.

## Version 08: Three Distinct Ways to Create

Instead of giving each of seven shops a different set of questions, this version focuses on three workshops with genuinely different interactions:

1. **Bookshop — Piece Together a Street:** Drag four street fragments to connect roads, window frames, and lights. Pieces snap into position when released; press Space to rotate the selected piece. This shapes the spatial composition of the final nightscape.
2. **Fabric Shop — Weave a Beam of Light:** Drag nine color dots into three bands: sky, lamplight, and wet pavement. Press Space to cycle through clear, misty, and after-rain weather. This shapes color relationships, glow, and reflections.
3. **Pottery Studio — Follow the Light:** Hold the mouse or touch the canvas to draw through five points of light. Captured lights become part of the final nightscape; Space starts or ends a keyboard-drawn stroke. This shapes starlight, wind, reflections, and brushwork.

The workshops explore **space, color, and gesture**. There is no single correct answer, score, leaderboard, or penalty for failure. Players can experiment freely before delivering their interpretation to the guest.

All seven physical shops remain in the 3D street, but only the bookshop, fabric shop, and pottery studio are core creative stations. The remaining shops provide scenery and explorable interiors; visiting every shop is not a completion requirement.

## Design References

See [`research/interaction-concept-v08.md`](research/interaction-concept-v08.md) for the design notes. References for this iteration include:

- **Gorogoa / Carto:** Spatial rearrangement and connected fragments that change how a scene is read.
- **Florence:** Short, embodied gestures that express emotion rather than explain it through a questionnaire.
- **Pentiment:** Historical art as inspiration for interface and mark-making, without presenting a fictional experience as a historical reconstruction.

This project explores looking, juxtaposition, brushwork, and flat shapes and colors. It does not reproduce a famous painting or claim that its shops and activities are historically accurate depictions of Arles in 1888.

## Run Locally

Requirements: Python 3 and a modern browser with WebGL support. Node.js is needed only for the automated checks below. Three.js is bundled in `vendor/`; no package installation or AI API key is required.

```bash
git clone https://github.com/Francesca-Wqh/AI_art_interation.git
cd AI_art_interation
python3 serve.py
```

Then open:

- [Standalone workshop demo](http://127.0.0.1:8766/workshops.html)
- [Full 3D street](http://127.0.0.1:8766/index.html)

Keep the server terminal open while using the app. If port 8766 is already in use, stop the previous server or run `PORT=8767 python3 serve.py` and use port 8767 in the browser. On macOS, you can also double-click `start.command`.

## Controls

- **3D street:** WASD or arrow keys to move; mouse to look around; E to interact with doors and workstations.
- **Bookshop:** Drag fragments and release to snap. Select the next fragment with the on-screen button, or use Tab to focus the canvas and arrow keys to move the selected fragment. Space rotates it.
- **Fabric shop:** Drag color dots, use weather buttons or Space to change the weather, and use arrow keys to adjust the selected dot.
- **Pottery studio:** Hold and drag to trace the lights. Space starts or ends a stroke, arrow keys move the cursor, and color buttons select the ink.
- **All workstations:** Undo, redo, and restore the draft that was open when the workshop started.

## Local Data and Validation

- Progress is stored in the browser's `localStorage`. The app does not upload progress or call an AI API.
- Save format v08 can read older core progress from v05, v06, and v07. Legacy choices remain available for compatibility without requiring players to revisit all seven shops.
- The standalone demo has separate saved progress and does not overwrite the 3D street's journal.

Check JavaScript syntax:

```bash
for f in *.js; do node --check "$f" || exit 1; done
```

Run automated tests:

```bash
node --test *.test.mjs
```

The tests cover the state machine, save migration, canvas drawing, workshop gestures, and CPU-side 3D scene contracts. They do **not** replace final browser layout checks, touch-device performance testing, extended WebGL testing, or physical-controller acceptance testing.

## Earlier Iterations

[`research/interaction-concept-v05.md`](research/interaction-concept-v05.md) and [`research/interaction-concept-v06.md`](research/interaction-concept-v06.md) preserve the earlier seven-workstation designs, documenting the transition from multiple-choice interactions to three distinctive gesture-based activities.

## Third-Party Code

The bundled Three.js distribution retains its original license in [`vendor/THREE-LICENSE.txt`](vendor/THREE-LICENSE.txt).
