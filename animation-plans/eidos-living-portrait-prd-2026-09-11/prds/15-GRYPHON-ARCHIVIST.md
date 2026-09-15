# AR-01: Gryphon archive response

## Purpose

Gryphon represents memory, provenance and place. It appears only when the user asks where a work lives, opens archival details or enters the map.

## Visual role

- Use the supplied Gryphon source with the approved non-blue palette.
- Gryphon is secondary to the artwork and its metadata.
- No wing flap, blink, head turn or character acting.
- The response is a print-registration event, not a mascot performance.

## Map or provenance open

### Visual

1. Exact artwork thumbnail remains anchored.
2. A thin route or provenance line grows from the artwork metadata toward the map or archive panel over 180ms.
3. Gryphon's graphite plate is already present at 20 percent opacity.
4. Olive and muted coral plates register into it from 2px offsets over 180ms.
5. The literal city, collection and source become readable live text.

### Timing

- Drawer or panel: 220ms, `cubic-bezier(0.32, 0.72, 0, 1)`.
- Gryphon registration: 180ms, beginning 40ms after panel starts.
- No stagger longer than 40ms.

## Archive success

When a source or location is confirmed, one small open-circle segment appears beside the live record. Do not stamp the artwork itself.

## Missing location

Show literal copy:

`current location not confirmed`

Do not invent a pin, museum or city. Do not animate uncertainty.

## Reduced motion

Open the panel with 120ms opacity. Show the registered Gryphon state immediately.

## Acceptance

- A user sees Gryphon and understands that deeper record information has opened.
- The actual location and provenance remain more prominent than the character.
- Blue appears nowhere on Gryphon.
- No generated video is required.

