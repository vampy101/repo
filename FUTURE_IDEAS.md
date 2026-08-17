# Future ideas

Things that came up while building the slice and were deliberately left out of
it. Nothing here is required for the scene to be finished; it is a parking lot,
not a roadmap.

## Deepening what is already there

- **A fourth solution: the hopper.** The refuse hopper is chained and currently
  only scenery and cover. A route that gets Mara *inside* it and carried through
  the door by a sanitation cycle would reward the player who thinks about the
  blind spot as a vehicle rather than a hiding place.
- **CIVIC remembers between runs.** A tiny cross-session record — "you have
  stood in this alley four times; twice you fixed the drone" — that changes only
  its opening line. Cheap, and unsettling in the right way.
- **A second personal question.** CIVIC's question is currently a single beat.
  Asking a follow-up that references how the player actually played (repaired the
  drone vs shoved it, bluffed vs confessed) would make the hidden path feel
  authored rather than unlocked.
- **Let the drone follow.** A repaired SW-9 could trail Mara for the rest of the
  scene, complaining, and act as a portable "ordinary municipal activity" that
  suppresses attention nearby.
- **Attention memory on individual objects.** The camera notices *which* thing
  Mara tampered with and watches that object more closely afterwards.
- **A visible sweep timer.** The opening mentions an approaching patrol but
  nothing enforces it. A soft clock that only becomes visible above attention 7
  would add pressure without punishing exploration.

## Presentation

- **A hand-drawn bitmap font** for the HUD, replacing the CSS monospace, so the
  interface matches the in-scene 1-bit type exactly.
- **Lightning / passing traffic**, throwing one frame of hard blue light down the
  alley and briefly revealing detail the ambient palette hides.
- **Reflections in the puddle that track Mara**, not just the camera.
- **Per-surface rain**: drops that stop at the hopper lid and the door lintel
  instead of falling through everything.
- **A volume slider** in the HUD; there is a `setVolume` on the audio module with
  no control wired to it.

## Systems the brief explicitly excluded

Recorded so the reasoning is not lost, not because they should be built:

- A second scene (the stairwell behind the door).
- Combat, an economy, shops, crafting beyond the retrieval strip.
- Levelling that spends XP rather than only displaying it.
- Procedural city generation, online features, accounts.
- A lore encyclopedia and a long opening cinematic.

## Engineering

- **A custom Phaser build.** The bundle is ~1.3 MB and almost all of it is
  Phaser features this scene never touches (physics, tilemaps, particles).
- **Touch support.** Tap to walk, long-press to examine, a drawer for the
  inventory. The hotspot rectangles are already big enough.
- **Accessibility.** A high-contrast palette toggle, a text-size control, and a
  keyboard-only hotspot cycle so the scene is playable without a mouse.
- **Record and replay.** The engine already turns each action into a `Reaction`;
  logging the action stream would give exact repro for any reported soft lock and
  make the browser playtest shorter.
