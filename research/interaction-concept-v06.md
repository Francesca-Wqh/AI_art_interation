# v06 — From Choosing Answers to Hands-on Creation

Date: 2026-09-20. Scope: `cafe-terrace-studio`, without rewriting the earlier 3D prototype or the separate *As Long as You Are Watching* project.

## 1. Research Scope and Reliability

### Completed: Review of the Existing Experience

The review covered the v05 versions of `interactions.js`, `story-ui.js`, `studies.js`, `postcard.js`, and the original design notes. The seven locations had different concepts but identical interaction structures: press E to open a card, choose one of two buttons, view an automatically generated image, and record the choice. Players could not change the intermediate process, and each result was stored as a single string.

The priority was therefore not to add more questions, but to address **repetitive actions, a lack of continuous control, no individual player marks, and a weak causal connection between interaction and the final nightscape**. These are findings from a code and workflow review, not from user testing or a psychology experiment.

### Completed: Reading a Locally Cached Primary Art Source

- Source: *Vincent van Gogh — The Letters*, letter 678 to Willemien van Gogh. The page title dates it to September 9 and approximately September 14, 1888.
- Official entry point: `https://vangoghletters.org/vg/letters/let678/letter.html`.
- The material actually read was the existing cache `/tmp/aie3905-letter678.html`, last modified on 2026-09-18. It was not downloaded anew in this iteration, and the live page may have changed.
- Cache SHA-256: `642fe92ccbbba03855f2e3807e5f03b74f62a03373195ee10259bce73af32aa5`.
- Review scope: English translation sections `1r:4` and `2r:5`. These discuss the many colors of night, café lights and the surrounding darkness, and observing and painting directly at night. This supports an emphasis on observation, color relationships, and handmade marks rather than memorizing art-history answers. This is a paraphrase, not invented dialogue attributed to the artist.
- These materials **do not establish** that the seven shops, owners, addresses, interiors, or minigames existed on the actual street in 1888.

### Not Completed: Online Game References and Museum Collection Verification

Web searches in this iteration returned no readable results. Requests to official game sites encountered network restrictions; the permission-review service returned 502 when network execution was requested, so those requests did not run. Candidate references such as Gorogoa and Tate Kids were not presented as verified findings.

The readable content of the existing `/tmp/aie3905-museum.html` cache was a general search page, not a sufficient collection description for verifying this painting. It was not counted as verified collection evidence.

The following are design hypotheses proposed and implemented from the project review and art material read. Whether they are more engaging still requires actual playtesting.

## 2. Design Decisions

1. **Act first, then see the result.** Replace two textual answers with moving, drawing, and arranging.
2. **Enable free creation rather than seven new quizzes.** No unique correct composition, time limit, or perfect-score requirement; the three core activities remain playable in any order.
3. **Keep the data created by the gesture.** Save stroke point sequences, individual object coordinates, and continuous color parameters instead of reducing the action back to a binary category.
4. **Put consequences nearby.** Show a live final-nightscape preview beside the workstation, rather than requiring a full walk down the street to discover what changed.
5. **Make experimentation inexpensive.** Provide undo, redo, and restoration of the starting draft. Only saving to the journal commits changes; closing or canceling restores the previous record.
6. **Preserve the atmosphere.** Do not add coins, reaction-speed tests, AI dialogue with historical figures, or network-dependent generation. Keep it a nighttime art experience that can be explored slowly.

## 3. Seven Workstations Implemented in v06

| Location | Interaction | Stored data | Effect on the nightscape |
|---|---|---|---|
| Bookshop · Core | Drag a viewfinder; adjust position and zoom | x / y / zoom | Horizon height, horizontal composition, zoom |
| Fabric shop · Core | Slide across fabric to mix colors and adjust proportions | Warmth, coolness, balance | Continuous color relationships between buildings and sky |
| Pottery studio · Core | Draw freely; dot stars, trace curves, change pigment and width | Actual path points, colors, widths | Original strokes enter the night sky |
| Grocery · Optional | Drag six fruits individually | Each fruit's 2D coordinates | Terrace foreground still-life placement |
| Wine merchant · Optional | Slide background hue while bottles remain unchanged | Continuous hue | Surrounding color of the nightscape frame |
| Bakery · Optional | Move a light source and adjust color temperature | Light coordinates and temperature | Window color and brightness, terrace light patches |
| Florist · Optional | Drag individual flowers with stems following | Seven flower positions | Foreground bouquet height and direction |

Light and pigment are stylized, not physically accurate pigment mixing, baking simulation, or ray tracing. Workstations remain 2D panels over the 3D scene, not direct manipulation of meshes in the 3D world. Interior artwork updates in sync; some tabletop objects also update their colors or arrangements.

## 4. Architecture and Boundaries

- `workshop-model.js`: Default works, numerical limits, serialization, legacy-category compatibility, and descriptions. Coordinates retain four decimal places.
- `workshop-art.js`: Workshop canvases and actual stroke rendering.
- `workshop-ui.js`: Pointer Events, keyboard controls, undo/redo, local animation frames, and live previews.
- `interactions.js`: v6 `works` saves; v5 records remain readable and preserve progress. Original categories support migration and legacy scene fallback, rather than serve as answers for new workstations.
- `story-ui.js`, `studies.js`, `postcard.js`: Carry actual workshop data into the journal, in-scene displays, and PNG output.
- `workshops.html`: A standalone demo without 3D loading, sharing the same workstations as the street. A separate storage key prevents it from changing the main game.
- At most 60 strokes per work, 140 points per stroke, and 30 undo steps. Long strokes thin earlier samples while retaining the newest endpoint to bound growth; the drawing feel still needs testing.
- No additional rendering dependencies, external assets, AI APIs, lights, or shadow maps. Textures are marked for update only after changes; this is not a performance guarantee.

## 5. Validation Record

Historical result for 2026-09-20: `node --test *.test.mjs` reported **81 passing tests** for v06; all top-level JavaScript files passed `node --check`. This is an earlier-version record, not the current version's test count.

Added coverage:

- v5-to-v6 migration, actual work persistence, and defensive copies that do not mutate saved data.
- Progress cannot be recorded before collecting the journal; a blank drawing cannot be submitted.
- Small changes within the same legacy category make a completed nightscape require redelivery.
- All seven work types produce differences in the standalone preview, interior artwork, and final nightscape.
- Continuous parameters such as zoom, fabric proportions, and light position affect drawing.
- Keyboard input, pointer cancellation, individual dragging, undo/redo, and cleanup of pending frames on close.
- The complete three-core-activities-to-café-to-PNG-entry flow using the mock DOM.
- Storage failures show a warning rather than falsely claiming a successful autosave.
- Regression coverage for existing doorways, collisions, navigation, and scene assembly.

**Limits:** DOM tests use a small custom node/event stand-in, and drawing tests compare Canvas drawing commands. These are not browser layout, actual PNG-pixel, WebGL, touch, or physical-controller acceptance tests.

During this iteration, the local preview server could not bind its port under the execution restrictions. A permission request returned 502, and the server did not start. No new browser screenshots were captured, and no claim was made that v06 had passed visual or frame-rate acceptance testing.

## 6. Next Playtesting Pass: Pending, Not Completed Results

1. Use the mouse at all seven stations in `workshops.html`; check dragging, long strokes, undo, and cancellation.
2. Test 390 px phone width, the 720 px breakpoint, and landscape projection: no horizontal overflow, usable touch controls, and scrollable panels.
3. In the full street, press E to open a door, walk inside, and press E at the workstation; closing the panel must not leave movement or stick input active.
4. Complete the three core activities, return to the café, download a PNG, and compare it with the preview and easel. Reload and confirm that all paths and coordinates persist.
5. Test a physical controller's LB/RB, D-pad, and A/B, plus a keyboard-only route without the mouse.
6. Ask classmates who have not read the instructions to try it: can they discover the first action, explain what it changes, and choose to retry? Do not prime them by saying the new version is more engaging.
