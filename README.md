# Steel Plant Tracker - Professional UI & Logic Update

This update introduces the advanced visual and functional requirements for the tracker.

## Key Improvements in this Version:
1. **Perfect Centering Engine**: Badges no longer drift. They use `transform: translate(-50%, -50%)` applied to a `0x0` Leaflet container, ensuring they stay perfectly glued to the exact center of your vectorized zones, regardless of text length or zoom level.
2. **Professional Glass UI**: Badges now feature a semi-transparent background with a frosted glass `backdrop-filter` effect, so the engineering diagram underneath remains partially visible.
3. **Dynamic Zoom Details**: When you zoom in (`map.getZoom() >= 1`), the badges automatically expand slightly and reveal extra data (Zone ID and Status) directly on the map.
4. **Connection Lines (Orthogonal Routes)**: 
   - A new **Polyline tool** (the zig-zag line icon) has been enabled in the drawing toolbar.
   - Click to start, click at the corners to bend at 90 degrees, and double-click to finish drawing a connection line between machines.
   - It renders as a professional dashed orange blueprint line (`#ff8c00`).
   - You can name the line and even assign workers to it (the badge will appear exactly in the middle of the line).

## Instructions:
1. Extract this ZIP.
2. Replace your previous `index.html` with this new one.
3. Make sure `F_D1.jpg` is in the same folder.
4. Open `index.html` in your browser. (Note: Because this version uses a slightly different local storage key to prevent conflicts with old uncentered data, your map will start fresh).
