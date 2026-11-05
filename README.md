# Plant Tracker – Location Panel & Zone Transfer Update

## What's updated
- Added a close (×) control to the Plant location panel.
- Clicking **Go to plant location** now saves/centres the map and closes the location panel.
- Added **Transfer zones** workflow to copy existing engineering drawing zones to the satellite map.
- Uses three matching reference points to calculate an affine transformation from engineering drawing coordinates to projected geographic coordinates.
- Transfers markers, polygons/rectangles and polylines as independent satellite features.
- Transferred satellite features can be adjusted with the satellite map's existing Leaflet Draw edit toolbar.
- The alignment transform and transferred satellite zones are saved in browser LocalStorage.

## How to transfer an engineering zone
1. Open **Transfer zones**.
2. Select **Align maps (3 points)**.
3. On the Engineering Drawing, click a recognizable physical reference point (for example, a building corner or conveyor junction).
4. Switch to Satellite View and click the exact same physical point.
5. Repeat for two more well-spaced, non-collinear reference points.
6. Select an engineering zone from the dropdown and click **Transfer selected zone**.
7. Verify the result and use the satellite edit toolbar to fine-tune its vertices.

## Important accuracy note
The uploaded F_D1 drawing is a process schematic, not a surveyed site plan. Its equipment and process layout may not be geographically scaled. Three-point affine alignment is a best-fit mapping method for a reasonably plan-like drawing; it cannot make a non-geographic process schematic physically accurate. Use identifiable matching site features and verify every transferred object manually. For a schematic with distorted/non-uniform geometry, manually redraw the satellite footprint or use more advanced control-point warping in a later phase.

## Deployment
- Replace `index.html` in the GitHub repository.
- Keep `F_D1.jpg` in the same directory.
- Commit and push the changes.
- Existing localStorage data remains in the same browser because the existing storage keys are retained.
