# v08 — Three Distinct Workshop Games

Date: 2026-09-28
Scope: the shop workstations, commission flow, and final postcard in `cafe-terrace-studio`.

## 1. Why Reduce Seven Workstations to Three?

Although v07 moved beyond binary choices to dragging, color mixing, and drawing, the seven workstations could still feel like seven parameter panels: move something, watch a preview, and save. More stations did not necessarily mean more kinds of interaction.

Version 08 therefore retains three shops with full activities:

- Bookshop: a spatial assembly game.
- Fabric shop: a color-distribution game.
- Pottery studio: a light-following drawing game.

The other shops remain part of the street and its architecture. Players no longer need to complete them all, and optional shops are not presented as mandatory minigames.

## 2. Design Patterns

This iteration draws on three interaction structures, rather than copying another game's art or story:

1. **Spatial rearrangement and visual connections:** Inspired by picture-tile and map-reassembly games. Players move, rotate, and connect visual clues to organize a viewing path instead of choosing one of four answers.
2. **Juxtaposition rather than sliders:** The color activity is not a pair of warm/cool sliders. Players place dots in spatial bands, changing colors through their relationships with neighbors. This is closer to observing how colors meet in painting of the period.
3. **Embodied tracing:** Drawing does not require likeness or a single correct answer. Players trace a continuous path through briefly appearing lights. Caught lights become part of the artwork, while deviations leave personal marks.

Artistically, v08 draws on nighttime observation, complementary color relationships, visible brushwork, and flat shapes and colors. It neither reconstructs a particular painting nor claims its shops and activities are historical facts about the street in 1888.

## 3. Rules for the Three Games

### 01 Bookshop — Piece Together a Street

- The canvas contains four street fragments.
- Drag a fragment toward a target position to snap it into place; press Space to rotate the selected piece.
- Roads, window frames, lights, and sky appear in the fragments. Their relative positions directly influence the final composition.
- There is no “correct puzzle” prompt. Different arrangements can all be saved to the journal.

### 02 Fabric Shop — Weave a Beam of Light

- The canvas contains nine colored dots and three bands: sky, lamplight, and wet pavement.
- Drag dots into different bands. Press Space to cycle through clear, misty, and after-rain weather.
- The color distribution determines warm/cool balance, contrast, glow, and rain reflections, rather than a single slider.
- Players may deliberately depart from a commission's color suggestions; the work remains valid.

### 03 Pottery Studio — Follow the Light

- Five fleeting points of light can be followed.
- Hold the mouse to draw. Passing through the next light records a capture. Space starts or ends a keyboard-controlled stroke.
- Captured lights influence highlights and echoing lines in the final nightscape; original strokes are also retained.
- The focus is observation and rhythm, not a speed leaderboard. There is no failure penalty.

## 4. Keeping the Interactions Distinct

| Workstation | Main actions | Feedback | Final effect |
|---|---|---|---|
| Bookshop | Move / rotate / align | Lines connect; space opens | Composition, vanishing point, subject density |
| Fabric shop | Distribute / juxtapose / swap | Relationships between three color bands change | Sky, lights, shadows, weather |
| Pottery studio | Follow / trace / deviate | Lights are caught; paths remain | Starlight, wind, reflections, brushwork |

The games address space, color, and gesture rather than sharing one “tabs plus sliders” template.

## 5. Implementation and Boundaries

- Save format advances to v08 while continuing to read v05, v06, and v07 core progress. Old optional shops do not force players to repeat activities.
- `works.books` stores four fragments' positions and rotations; `works.cloth` stores nine color-dot positions; `works.atelier` stores strokes, captured lights, ink colors, and stroke width.
- The final postcard is still drawn deterministically with local Canvas rendering, using the player's data. No new network dependencies, AI APIs, camera access, or microphone access are introduced.
- Art is not judged by a score. Commission feedback remains descriptive, and players can repeatedly revise the same commission.

## 6. Reference Works: Mechanics, Not Asset Sources

- **Gorogoa:** How rearranging images can make relationships themselves the puzzle.
- **Carto:** How moving map fragments can change spatial connections.
- **Florence:** How short, single gestures can express emotional change without lengthy text questionnaires.
- **Pentiment:** How historical art can shape an interface and a way of looking without turning the player into a quiz-taker.

These works provide inspiration at the level of mechanics. The scene, commissions, color dots, street fragments, and strokes are original procedural content created for this project.
