# Plant Tracker – Draggable Zone Badge Anchors (v4)

## What's changed
- Zone status/personnel badges are now draggable on both Engineering Drawing and Satellite View.
- Dragging a badge stores its own anchor coordinate on the corresponding zone.
- Badge anchors remain fixed in map coordinates while zooming and panning.
- Removed automatic collision-offset positioning that previously moved badges away from the equipment/zone location.
- New polygon badges default to a polygon area centroid; rectangles/lines/markers use a geometry-derived fallback.
- Existing zone geometry, satellite registration and localStorage data are retained.

## How to position badges
1. Open Engineering Drawing.
2. Touch and hold a zone badge, then drag it to the desired equipment location (for example, the X-marked points in your screenshot).
3. Release. The badge position is saved automatically.
4. Repeat for each zone.
5. Switch to Satellite View and independently position a satellite badge if required. Its position is saved separately in geographic coordinates.

## Important
- Badge position is an independent display anchor. Moving a badge does not move or resize the zone boundary.
- Engineering and satellite badge positions are stored in their respective coordinate systems. If you transfer zone geometry, position the satellite badge after transfer if the desired equipment point differs.
- This update intentionally disables automatic badge collision shifting. If two badges overlap, drag one to a clear position.
- Data remains in browser LocalStorage; it is not synced across devices.
- Validate all zones and geographic alignment against known site features before operational use.

## Deploy
Replace `index.html` and `F_D1.jpg` in your GitHub Pages repository. Keep them in the same directory. Do not clear browser site data.
