# Plant Tracker – Four-Point Map Registration Fix

## Files
- `index.html` – updated app and four-point projective registration
- `F_D1.jpg` – engineering drawing used by Engineering View

## What changed
- Replaced the three-point affine alignment with four-point projective (homography) registration.
- Old three-point alignment data is not trusted; perform registration again.
- Transfers every vertex of engineering polygons, rectangles, polylines and markers.
- Re-transferring a zone updates its previous satellite copy instead of creating duplicates.
- Clarifies that a data link shares operational data but does not geographically align shapes.
- After transfer, opens Satellite View at the transferred geometry.

## Correct registration workflow
1. Open **Transfer zones**.
2. Tap **Register maps (4 points)**.
3. On Engineering Drawing, tap a permanent landmark identifiable in satellite imagery.
4. Switch to Satellite View and tap the exact same physical point.
5. Repeat for four landmarks. Spread points around the plant footprint, roughly near its corners. Do not use four nearby or collinear points.
6. Select an engineering zone and tap **Transfer selected zone**.
7. Inspect the transferred outline at close zoom. If offset, repeat with more accurately identified landmarks.

## Important
- Engineering and satellite points must be paired in the same order and represent exactly the same physical locations.
- Independently drawn satellite zones are not moved by registration. Use **Transfer selected zone** to create/update satellite geometry from the engineering zone.
- A blue/green/red linked label alone indicates shared data identity, not geographic alignment.
- This app stores data in browser LocalStorage and does not synchronize across devices.
- Validate all geometry against known site features before operational or safety-critical use.

## Deploy
Replace `index.html` and `F_D1.jpg` in the GitHub Pages repository. Keep them in the same folder. Preserve browser site data to retain existing zones and personnel.
