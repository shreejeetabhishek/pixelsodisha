# Plant Tracker – Satellite Focus & Mobile Navigation Update

## Included files
- `index.html` – updated application
- `F_D1.jpg` – engineering drawing used by Engineering View

## Changes in this update
- Satellite View now restores the last saved map center and zoom level.
- If no saved viewport exists, it opens at the saved plant reference at close zoom; if there is no plant reference, it fits saved satellite zones where possible.
- Recenter now prioritizes the saved plant reference or the saved zone extent rather than returning to a country-wide view.
- Satellite map viewport is saved locally as the user pans or zooms.
- Mobile navigation uses a two-row responsive grid so Engineering Drawing, Satellite View, Recenter, Routes and Transfer remain visible without horizontal clipping.
- Leaflet zoom/drawing controls are positioned below the two-row mobile navigation.
- Satellite zone labels use viewport-aware placement and avoid collisions where possible.
- Map clicks no longer silently change the saved plant reference. Use **Pick on map** in Plant Location Setup to deliberately choose a new reference point.
- Existing engineering/satellite zone, status, personnel, route and local-storage workflows are retained.

## Important limitations
- Data is stored in browser LocalStorage. It is not synchronized across devices or users.
- This update restores the plant location and viewport already saved in the browser; it cannot infer a different physical plant location if the saved coordinates themselves are incorrect.
- Map alignment still requires the user to perform the three-point alignment workflow and verify the transferred geometry against known site features. Do not use unverified alignment for safety-critical decisions.
- Leaflet and Leaflet Draw load from public CDNs; satellite imagery is provided by Esri. Internet access is required.

## Deployment
Replace `index.html` and `F_D1.jpg` in the GitHub Pages repository with the files in this ZIP. Keep both files in the same directory. Commit and push the changes.

## Browser data
The update preserves existing LocalStorage keys. It adds `plant_satellite_viewport_v1` to remember the satellite map center and zoom. Do not clear site data if you need to retain your saved zones and personnel records.
