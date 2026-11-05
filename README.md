# Plant Tracker – Satellite Site-Layout Editing Update

## What changed

The Satellite View now has its own full editable site-layout layer, separate from the Engineering Drawing coordinates.

### Satellite map editing
- Draw polygon zones and site boundaries.
- Draw rectangles for plant areas/buildings.
- Add equipment/site markers.
- Draw polylines for roads, conveyors or other routes.
- Edit vertices and move shapes with the Leaflet Draw edit toolbar.
- Delete selected shapes with the delete toolbar.
- Assign equipment symbols and operating status to satellite zones from Machine Settings.
- Display zone labels, status indicators and assigned manpower badges.
- Satellite zones and their geometry persist in browser LocalStorage under `plant_satellite_zones_v1`.

### Engineering drawing
- Existing Engineering Drawing workspace and its zones remain separate and unchanged.
- Existing independent connection-route functionality is retained.

## Important coordinate behaviour
Engineering drawing coordinates and satellite latitude/longitude are intentionally independent. A polygon drawn on the engineering schematic is not automatically projected onto the satellite map because the uploaded process schematic is not a geographically surveyed site plan. Recreate/draw the real site boundaries and equipment positions in Satellite View, using the engineering drawing as a reference. Shared equipment IDs and database synchronization can be added in a later backend phase.

## Deployment
1. Extract the ZIP.
2. Replace `index.html` in the existing GitHub repository.
3. Keep `F_D1.jpg` in the same directory as `index.html`.
4. Commit and push the changes.
5. Open Satellite View. Use the Leaflet drawing toolbar on the left to draw polygons, rectangles, markers and polylines. Use the edit and delete tools to modify them.

## Storage note
This update continues to use browser LocalStorage. Satellite zones are saved on the device/browser where they are created; they are not yet synchronized across multiple devices or users.
