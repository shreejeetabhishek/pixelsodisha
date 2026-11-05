# Plant Tracker – Zone Linking & Popup Collision Update

## Included
- Satellite and engineering map modes remain independent.
- Plant-location, transfer and connection panels are mutually exclusive to reduce UI overlap.
- Mobile panel positioning is improved.
- Satellite zone labels are compact and automatically offset to reduce overlap.
- Added **Link independently drawn zones** inside Transfer zones:
  1. Draw the zone on Engineering Drawing.
  2. Draw its real-world counterpart on Satellite View.
  3. Open Transfer zones.
  4. Select the matching engineering and satellite zones.
  5. Click Link these zones.
- Linked zones receive a shared `linkGroupId`; their geometry remains independent and editable.
- Link can be removed without deleting either zone.
- Data remains in browser LocalStorage, consistent with the current app. This is not yet Supabase synchronization.

## Deployment
Replace `index.html` in the same GitHub Pages directory and keep `F_D1.jpg` beside it.
