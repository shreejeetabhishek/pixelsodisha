# Plant Tracker – Mobile Badge Positioning Fix v5

## What changed
- Fixed the Leaflet zero-size `DivIcon` positioning: the badge card is explicitly centred on its geographic anchor (`left:0; top:0; translate(-50%,-50%)`).
- Mobile badge cards now use a narrower responsive width and compact typography so their visual centre remains on the zone anchor.
- Old saved badge offsets from earlier versions are treated as legacy and ignored. By default, polygon/rectangle badges are recalculated from the zone's polygon centroid; marker/polyline badges use their geometry centre.
- A manually dragged badge is saved with an explicit `badgeAnchorMode: "manual"` flag and remains at that chosen map coordinate.
- The same rules apply in Engineering and Satellite views. Zooming and panning do not change the geographic anchor.

## Deploy
1. Replace `index.html` and `F_D1.jpg` in the GitHub Pages repository.
2. Keep both files in the same directory.
3. Hard-refresh the page on the phone after deployment. Existing zone geometry, workers and four-point map registration are preserved in browser storage.

## Note
This corrects responsive marker anchoring and defaults badge placement to zone geometry. For irregular or multi-part polygons, inspect the calculated centroid and manually reposition only if the equipment itself is not at the geometric centre. Manual positions are saved independently of zone boundaries.
