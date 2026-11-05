# Plant Tracker – Reliability, Synchronization & UI/UX Update

## Fixes and improvements
- Satellite polygons, rectangles, markers and polylines are restored from LocalStorage after map initialization and page reload.
- Satellite map re-renders saved zones and connection routes after map view changes.
- Status and symbol edits on a linked engineering/satellite pair now propagate to both linked records.
- Manpower assignments are reflected on the linked counterpart map.
- Linking enforces one-to-one zone pairs, avoiding accidental multiple-zone link groups.
- Deleting one linked zone removes the association from its counterpart but does not delete the counterpart geometry.
- Local persistence writes all current map datasets and handles storage errors with a visible warning.
- Satellite labels are more compact on mobile and scale gently with map zoom.
- Location and transfer panels have consistent responsive dimensions, scroll limits, safe-area handling and improved layering.
- Existing independent map geometry is preserved.

## Data persistence note
This version continues to use browser LocalStorage. Data is saved on the same browser/device and same website origin. It is not cross-device Supabase synchronization. Clear site data/browser storage can erase locally stored data; export/backup is recommended.

## Deployment
Replace `index.html` and `README.md` in the GitHub Pages repository. Keep `F_D1.jpg` in the same directory.
