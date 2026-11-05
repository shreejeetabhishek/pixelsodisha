
        let currentMapView = 'engineering';
        let satelliteMap = null;
        let plantSiteMarker = null;
        let plantSite = JSON.parse(localStorage.getItem('plant_site_location_v1') || 'null');
        let connectionRoutes = JSON.parse(localStorage.getItem('plant_connection_routes_v1') || '[]');
        let connectionDrawing = false;
        let connectionEditing = false;
        let pendingConnectionPoints = [];
        let engineeringConnectionLayer = null;
        let satelliteConnectionLayer = null;
        let engineeringEditControl = null;
        let satelliteEditControl = null;
        let satelliteZones = JSON.parse(localStorage.getItem('plant_satellite_zones_v1') || '[]');
        let satelliteDrawnItems = null;
        let satelliteZoneBadgeMarkers = {};
        let satelliteDrawControl = null;
        let zoneAlignment = { active:false, phase:'source', pairs:[], pendingSource:null };
        // Only accept the new four-control-point projective transform.
        // Older three-point affine transforms are intentionally ignored because
        // they can produce large positional errors over a plant-sized drawing.
        let zoneAlignmentTransform = (() => {
            try {
                const saved = JSON.parse(localStorage.getItem('plant_zone_alignment_v1') || 'null');
                return saved && saved.version === 2 && Array.isArray(saved.h) && saved.h.length === 8 ? saved : null;
            } catch (_) { return null; }
        })();
        let satellitePanelDismissed = false;
        document.addEventListener('DOMContentLoaded', () => { const b=document.getElementById('transferZoneBtn'); if (b) b.disabled = !(zoneAlignmentTransform && zoneAlignmentTransform.version===2); });
        let plantLocationPicking = false;

        function toggleSidebar() {
            document.body.classList.toggle('sidebar-closed');
            setTimeout(() => { map.invalidateSize(); if (satelliteMap) satelliteMap.invalidateSize(); }, 300);
        }

        function isValidPlantSite(site) {
            return !!site && Number.isFinite(Number(site.lat)) && Number.isFinite(Number(site.lng)) &&
                Number(site.lat) >= -90 && Number(site.lat) <= 90 && Number(site.lng) >= -180 && Number(site.lng) <= 180;
        }
        function readSavedSatelliteViewport() {
            try {
                const v = JSON.parse(localStorage.getItem('plant_satellite_viewport_v1') || 'null');
                if (!v || !Array.isArray(v.center) || v.center.length !== 2 || !Number.isFinite(v.zoom)) return null;
                const lat=Number(v.center[0]), lng=Number(v.center[1]);
                if (lat < -90 || lat > 90 || lng < -180 || lng > 180 || v.zoom < 1 || v.zoom > 19) return null;
                return { center:[lat,lng], zoom:Math.max(2,Math.min(19,v.zoom)) };
            } catch (_) { return null; }
        }
        function saveSatelliteViewport() {
            if (!satelliteMap || !satelliteMap.getCenter()) return;
            const c=satelliteMap.getCenter();
            localStorage.setItem('plant_satellite_viewport_v1', JSON.stringify({center:[c.lat,c.lng],zoom:satelliteMap.getZoom()}));
        }
        function getSatelliteZonesBounds() {
            if (!satelliteZones || !satelliteZones.length) return null;
            const points=[];
            satelliteZones.forEach(z=>{
                if (z.type === 'marker' && z.latlng && Number.isFinite(Number(z.latlng.lat)) && Number.isFinite(Number(z.latlng.lng))) points.push([Number(z.latlng.lat),Number(z.latlng.lng)]);
                else if (z.latlngs) {
                    const flatten=a=>Array.isArray(a) ? a.forEach(flatten) : (a && Number.isFinite(Number(a.lat)) && Number.isFinite(Number(a.lng)) ? points.push([Number(a.lat),Number(a.lng)]) : null);
                    flatten(z.latlngs);
                }
            });
            return points.length ? L.latLngBounds(points) : null;
        }

        function initializeSatelliteMap() {
            if (satelliteMap) return;
            satelliteMap = L.map('satellite-map', { zoomControl: true, preferCanvas: true }).setView([20.5937, 78.9629], 5);
            // Restore the last useful map viewport. If none exists, center on the saved plant
            // reference; otherwise fit the saved satellite zones instead of leaving the user
            // at the India-wide default view.
            const savedViewport = readSavedSatelliteViewport();
            if (savedViewport) {
                satelliteMap.setView(savedViewport.center, savedViewport.zoom, { animate:false });
            } else if (isValidPlantSite(plantSite)) {
                satelliteMap.setView([plantSite.lat, plantSite.lng], 17, { animate:false });
            } else if (satelliteZones.length) {
                const zoneBounds = getSatelliteZonesBounds();
                if (zoneBounds && zoneBounds.isValid()) satelliteMap.fitBounds(zoneBounds, { padding:[36,36], maxZoom:17, animate:false });
            }
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 19,
                attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
            }).addTo(satelliteMap);
            satelliteConnectionLayer = new L.FeatureGroup().addTo(satelliteMap);
            satelliteDrawnItems = new L.FeatureGroup().addTo(satelliteMap);
            renderConnectionRoutes();
            satelliteMap.on('click', function (event) {
                if (zoneAlignment.active && currentMapView === 'satellite') { captureSatelliteAlignmentPoint(event.latlng); return; }
                if (connectionDrawing && currentMapView === 'satellite') { addConnectionPoint(event.latlng); return; }
                if (plantLocationPicking) {
                    setPlantSite(event.latlng.lat, event.latlng.lng, true);
                    plantLocationPicking = false;
                    const pickBtn=document.getElementById('pickPlantLocationBtn');
                    if(pickBtn) pickBtn.textContent='Pick on map';
                }
            });
            satelliteEditControl = new L.Control.Draw({ draw:false, edit:{ featureGroup:satelliteConnectionLayer, remove:false } });
            satelliteMap.addControl(satelliteEditControl);
            satelliteDrawControl = new L.Control.Draw({
                position:'topleft',
                draw:{ polygon:{shapeOptions:{color:'#4da8da',weight:2,fillOpacity:.2}}, rectangle:{shapeOptions:{color:'#4da8da',weight:2,fillOpacity:.2}}, polyline:{shapeOptions:{color:'#00ff00',weight:4,dashArray:'10,14'}}, marker:true, circle:false, circlemarker:false },
                edit:{ featureGroup:satelliteDrawnItems, remove:true }
            });
            satelliteMap.addControl(satelliteDrawControl);
            satelliteMap.on('zoomend moveend', function(){
                layoutSatelliteBadges(); updateSatelliteBadgeScale();
                saveSatelliteViewport();
            });
            satelliteMap.on(L.Draw.Event.CREATED, onSatelliteZoneCreated);
            satelliteMap.on(L.Draw.Event.EDITED, onSatelliteZonesEdited);
            satelliteMap.on(L.Draw.Event.DELETED, onSatelliteZonesDeleted);
            satelliteMap.on(L.Draw.Event.EDITED, persistEditedConnections);
            // Restore persisted satellite geometry after the map and edit feature group exist.
            renderSatelliteZones();
            renderConnectionRoutes();
            if (plantSite && Number.isFinite(plantSite.lat) && Number.isFinite(plantSite.lng)) {
                document.getElementById('plantLatitude').value = plantSite.lat;
                document.getElementById('plantLongitude').value = plantSite.lng;
                placePlantMarker(plantSite.lat, plantSite.lng);
                document.getElementById('plantLocationStatus').textContent = 'Saved plant location: ' + plantSite.lat.toFixed(6) + ', ' + plantSite.lng.toFixed(6);
                if (!savedViewport) satelliteMap.setView([plantSite.lat, plantSite.lng], 17, { animate:false });
            }
        }

        function switchMapView(view) {
            currentMapView = view;
            const engineering = view === 'engineering';
            document.getElementById('map').style.display = engineering ? 'block' : 'none';
            document.getElementById('satellite-map').style.display = engineering ? 'none' : 'block';
            document.getElementById('satellitePanel').classList.toggle('visible', !engineering && !satellitePanelDismissed);
            document.getElementById('satelliteAttributionNote').style.display = engineering ? 'none' : 'block';
            document.getElementById('engineeringModeBtn').classList.toggle('active', engineering);
            document.getElementById('satelliteModeBtn').classList.toggle('active', !engineering);
            if (!engineering) initializeSatelliteMap();
            updateConnectionStatus();
            setTimeout(() => {
                if (engineering) map.invalidateSize();
                else {
                    satelliteMap.invalidateSize();
                    renderSatelliteZones();
                    renderConnectionRoutes();
                    updateSatelliteBadgeScale();
                }
            }, 180);
        }

        function recenterCurrentMap() {
            if (currentMapView === 'engineering') map.fitBounds(bounds);
            else if (satelliteMap) {
                if (isValidPlantSite(plantSite)) satelliteMap.setView([plantSite.lat, plantSite.lng], 17);
                else {
                    const b=getSatelliteZonesBounds();
                    if (b && b.isValid()) satelliteMap.fitBounds(b,{padding:[36,36],maxZoom:17});
                    else satelliteMap.setView([20.5937,78.9629],5);
                }
            }
        }

        function placePlantMarker(lat, lng) {
            if (!satelliteMap) return;
            if (plantSiteMarker) satelliteMap.removeLayer(plantSiteMarker);
            plantSiteMarker = L.marker([lat, lng]).addTo(satelliteMap).bindPopup('<strong>Plant site reference</strong><br>Confirm this position before using it operationally.').openPopup();
        }

        function setPlantSite(lat, lng, fromMapClick) {
            plantSite = { lat: Number(lat), lng: Number(lng) };
            localStorage.setItem('plant_site_location_v1', JSON.stringify(plantSite));
            document.getElementById('plantLatitude').value = plantSite.lat.toFixed(6);
            document.getElementById('plantLongitude').value = plantSite.lng.toFixed(6);
            document.getElementById('plantLocationStatus').textContent = 'Saved plant location: ' + plantSite.lat.toFixed(6) + ', ' + plantSite.lng.toFixed(6);
            placePlantMarker(plantSite.lat, plantSite.lng);
            if (fromMapClick) {
                satellitePanelDismissed = true;
                document.getElementById('satellitePanel').classList.remove('visible');
                satelliteMap.setView([plantSite.lat, plantSite.lng], Math.max(satelliteMap.getZoom(), 16));
            }
        }

        function goToPlantLocation() {
            const lat = Number(document.getElementById('plantLatitude').value);
            const lng = Number(document.getElementById('plantLongitude').value);
            if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                alert('Enter a valid latitude (-90 to 90) and longitude (-180 to 180).');
                return;
            }
            setPlantSite(lat, lng, false);
            satelliteMap.setView([lat, lng], 17);
            closeSatellitePanel();
        }

        function startPlantLocationPick() {
            plantLocationPicking=true;
            document.getElementById('plantLocationStatus').textContent='Tap the exact plant reference point on the map.';
            document.getElementById('pickPlantLocationBtn').textContent='Tap map to place…';
            document.getElementById('satellitePanel').classList.remove('visible');
        }
        function closeSatellitePanel() {
            satellitePanelDismissed = true;
            document.getElementById('satellitePanel').classList.remove('visible');
        }

        function toggleTransferPanel() {
            document.getElementById('connectionPanel').classList.remove('visible');
            document.getElementById('satellitePanel').classList.remove('visible');
            document.getElementById('transferPanel').classList.toggle('visible');
            refreshTransferZoneOptions();
            refreshZoneLinkOptions();
        }

        function refreshTransferZoneOptions() {
            const select = document.getElementById('transferZoneSelect');
            if (!select) return;
            const previous = select.value;
            select.innerHTML = '<option value="">-- Select engineering zone --</option>';
            zones.forEach(z => { const opt=document.createElement('option'); opt.value=z.id; opt.textContent=(z.symbol ? z.symbol+' ' : '')+z.name+' ('+z.type+')'; select.appendChild(opt); });
            if (zones.some(z=>z.id===previous)) select.value=previous;
        }

        function refreshZoneLinkOptions() {
            const eng=document.getElementById('linkEngineeringZone');
            const sat=document.getElementById('linkSatelliteZone');
            if (!eng || !sat) return;
            const oldE=eng.value, oldS=sat.value;
            eng.innerHTML='<option value="">-- Choose engineering zone --</option>';
            sat.innerHTML='<option value="">-- Choose satellite zone --</option>';
            zones.forEach(z=>{const o=document.createElement('option');o.value=z.id;o.textContent=z.name+' ('+z.type+')';eng.appendChild(o);});
            satelliteZones.forEach(z=>{const o=document.createElement('option');o.value=z.id;o.textContent=z.name+' ('+z.type+')';sat.appendChild(o);});
            if (zones.some(z=>z.id===oldE)) eng.value=oldE;
            if (satelliteZones.some(z=>z.id===oldS)) sat.value=oldS;
            showZoneLinkStatus();
        }
        function showZoneLinkStatus(message) {
            const out=document.getElementById('zoneLinkStatus');
            if (message) { out.textContent=message; return; }
            const e=document.getElementById('linkEngineeringZone')?.value;
            const s=document.getElementById('linkSatelliteZone')?.value;
            const ez=zones.find(z=>z.id===e), sz=satelliteZones.find(z=>z.id===s);
            if (ez?.linkGroupId && sz?.linkGroupId===ez.linkGroupId) out.textContent='These two zones are linked. Shared ID: '+ez.linkGroupId;
            else out.textContent='Choose one zone from each map, then link them.';
        }
        function linkSelectedZones() {
            const eid=document.getElementById('linkEngineeringZone').value;
            const sid=document.getElementById('linkSatelliteZone').value;
            const ez=zones.find(z=>z.id===eid), sz=satelliteZones.find(z=>z.id===sid);
            if (!ez || !sz) { showZoneLinkStatus('Select one engineering zone and one satellite zone.'); return; }
            // Enforce one engineering zone <-> one satellite zone per logical pair.
            const previousGroupIds = [ez.linkGroupId, sz.linkGroupId].filter(Boolean);
            previousGroupIds.forEach(oldGroup => {
                [...zones, ...satelliteZones].forEach(item => {
                    if (item.linkGroupId === oldGroup) delete item.linkGroupId;
                });
            });
            const group='pair_'+Date.now();
            ez.linkGroupId=group; sz.linkGroupId=group;
            localStorage.setItem('plant_zones_v4',JSON.stringify(zones));
            localStorage.setItem('plant_satellite_zones_v1',JSON.stringify(satelliteZones));
            saveToDatabase();
            refreshZoneLinkOptions();
            document.getElementById('linkEngineeringZone').value=eid;
            document.getElementById('linkSatelliteZone').value=sid;
            showZoneLinkStatus('Linked successfully. Both shapes remain independently editable; equipment identity and future status reporting can refer to this shared link.');
        }
        function unlinkSelectedZones() {
            const eid=document.getElementById('linkEngineeringZone').value;
            const sid=document.getElementById('linkSatelliteZone').value;
            const ez=zones.find(z=>z.id===eid), sz=satelliteZones.find(z=>z.id===sid);
            if (!ez || !sz || !ez.linkGroupId || ez.linkGroupId!==sz.linkGroupId) {
                showZoneLinkStatus('The selected zones are not linked to each other.'); return;
            }
            delete ez.linkGroupId; delete sz.linkGroupId;
            localStorage.setItem('plant_zones_v4',JSON.stringify(zones));
            localStorage.setItem('plant_satellite_zones_v1',JSON.stringify(satelliteZones));
            saveToDatabase(); refreshZoneLinkOptions();
            showZoneLinkStatus('Link removed. Neither geometry was deleted.');
        }

        function beginZoneAlignment() {
            if (!satelliteMap) initializeSatelliteMap();
            zoneAlignment = {active:true, phase:'source', pairs:[], pendingSource:null};
            document.getElementById('transferStatus').textContent =
                'Registration 1/4: tap a clear, permanent landmark on the engineering drawing. Then tap the SAME physical landmark in Satellite View.';
            switchMapView('engineering');
        }

        function captureEngineeringAlignmentPoint(latlng) {
            if (!zoneAlignment.active || currentMapView !== 'engineering' || zoneAlignment.phase !== 'source') return false;
            zoneAlignment.pendingSource = [Number(latlng.lng), Number(latlng.lat)];
            zoneAlignment.phase = 'target';
            const n = zoneAlignment.pairs.length + 1;
            document.getElementById('transferStatus').textContent =
                'Point ' + n + '/4 captured on drawing. Switch to Satellite View and tap the exact same physical landmark.';
            return true;
        }

        function captureSatelliteAlignmentPoint(latlng) {
            if (!zoneAlignment.active || currentMapView !== 'satellite' || zoneAlignment.phase !== 'target' || !zoneAlignment.pendingSource) return false;
            const projected = L.CRS.EPSG3857.project(latlng);
            zoneAlignment.pairs.push({
                source: zoneAlignment.pendingSource.slice(),
                target: [projected.x, projected.y]
            });
            zoneAlignment.pendingSource = null;

            if (zoneAlignment.pairs.length === 4) {
                const transform = calculateProjectiveTransform(zoneAlignment.pairs);
                if (!transform) {
                    zoneAlignment = {active:false, phase:'source', pairs:[], pendingSource:null};
                    document.getElementById('transferStatus').textContent =
                        'Registration failed: the four points are too close together or nearly collinear. Start again with four widely spaced landmarks.';
                    return true;
                }
                zoneAlignmentTransform = transform;
                localStorage.setItem('plant_zone_alignment_v1', JSON.stringify(transform));
                zoneAlignment = {active:false, phase:'source', pairs:[], pendingSource:null};
                document.getElementById('transferZoneBtn').disabled = false;
                document.getElementById('transferStatus').textContent =
                    '4-point registration saved. Select an engineering zone and transfer it. Verify the result against visible site features before use.';
                return true;
            }

            const next = zoneAlignment.pairs.length + 1;
            zoneAlignment.phase = 'source';
            document.getElementById('transferStatus').textContent =
                'Point ' + zoneAlignment.pairs.length + '/4 paired. Switch to Engineering Drawing and tap landmark ' + next + '. Use points spread around the plant, not in one small area.';
            switchMapView('engineering');
            return true;
        }

        // Solve an 8-parameter projective transform (homography) from four
        // engineering drawing points to four Web-Mercator satellite points.
        // Satellite coordinates are localized around their centroid to avoid
        // numerical instability from large EPSG:3857 values.
        function calculateProjectiveTransform(pairs) {
            if (!Array.isArray(pairs) || pairs.length !== 4) return null;
            const origin = [
                pairs.reduce((sum,p) => sum + p.target[0], 0) / 4,
                pairs.reduce((sum,p) => sum + p.target[1], 0) / 4
            ];
            const scale = 1000;
            const matrix = [];
            pairs.forEach(p => {
                const x = Number(p.source[0]), y = Number(p.source[1]);
                const u = (Number(p.target[0]) - origin[0]) / scale;
                const v = (Number(p.target[1]) - origin[1]) / scale;
                if (![x,y,u,v].every(Number.isFinite)) return;
                matrix.push([x,y,1,0,0,0,-u*x,-u*y,u]);
                matrix.push([0,0,0,x,y,1,-v*x,-v*y,v]);
            });
            if (matrix.length !== 8) return null;

            // Gaussian elimination with partial pivoting.
            for (let col=0; col<8; col++) {
                let pivot=col;
                for (let row=col+1; row<8; row++) {
                    if (Math.abs(matrix[row][col]) > Math.abs(matrix[pivot][col])) pivot=row;
                }
                if (Math.abs(matrix[pivot][col]) < 1e-11) return null;
                [matrix[col],matrix[pivot]]=[matrix[pivot],matrix[col]];
                const divisor=matrix[col][col];
                for (let k=col; k<=8; k++) matrix[col][k] /= divisor;
                for (let row=0; row<8; row++) {
                    if (row===col) continue;
                    const factor=matrix[row][col];
                    for (let k=col; k<=8; k++) matrix[row][k] -= factor*matrix[col][k];
                }
            }
            const h=matrix.map(row=>row[8]);
            if (!h.every(Number.isFinite)) return null;
            return {version:2, h, origin, scale};
        }

        function transformEngineeringPoint(point) {
            const t=zoneAlignmentTransform;
            if (!t || t.version !== 2 || !Array.isArray(t.h) || t.h.length !== 8) return null;
            const x=Number(point[0]), y=Number(point[1]), h=t.h;
            const denominator=h[6]*x+h[7]*y+1;
            if (!Number.isFinite(denominator) || Math.abs(denominator)<1e-10) return null;
            const u=(h[0]*x+h[1]*y+h[2])/denominator;
            const v=(h[3]*x+h[4]*y+h[5])/denominator;
            const projected=L.point(t.origin[0]+u*t.scale, t.origin[1]+v*t.scale);
            const latlng=L.CRS.EPSG3857.unproject(projected);
            if (!Number.isFinite(latlng.lat) || !Number.isFinite(latlng.lng)) return null;
            return latlng;
        }

        function transformEngineeringLatLngTree(node) {
            if (Array.isArray(node)) return node.map(transformEngineeringLatLngTree);
            if (node && typeof node === 'object' && Number.isFinite(Number(node.lat)) && Number.isFinite(Number(node.lng))) {
                const ll=transformEngineeringPoint([Number(node.lng),Number(node.lat)]);
                if (!ll) throw new Error('A zone vertex could not be transformed. Re-register the maps.');
                return [ll.lat,ll.lng];
            }
            throw new Error('Unexpected engineering geometry. Please redraw or edit this zone before transferring.');
        }

        function transferSelectedZone() {
            const id=document.getElementById('transferZoneSelect').value;
            const src=zones.find(z=>z.id===id);
            if (!src) return alert('Select an engineering zone first.');
            if (!zoneAlignmentTransform || zoneAlignmentTransform.version !== 2) return alert('Register the maps using four matching landmarks first.');
            try {
                const copy={
                    id:'sz_transfer_'+Date.now(),
                    name:src.name,
                    type:src.type,
                    status:src.status||'running',
                    symbol:src.symbol||'',
                    mapType:'satellite',
                    transferredFrom:src.id,
                    linkGroupId:src.linkGroupId || ('transfer_'+src.id)
                };
                if (src.type==='marker') {
                    const ll=transformEngineeringPoint([src.latlng.lng,src.latlng.lat]);
                    if (!ll) throw new Error('The marker could not be transformed.');
                    copy.latlng={lat:ll.lat,lng:ll.lng};
                } else {
                    copy.latlngs=transformEngineeringLatLngTree(src.latlngs);
                }

                // Replace a previous transfer of the same engineering zone,
                // rather than creating overlapping duplicate copies.
                const existingIndex=satelliteZones.findIndex(z=>z.transferredFrom===src.id);
                if (existingIndex>=0) {
                    const previous=satelliteZones[existingIndex];
                    copy.id=previous.id;
                    copy.linkGroupId=previous.linkGroupId || copy.linkGroupId;
                    satelliteZones[existingIndex]=copy;
                } else {
                    satelliteZones.push(copy);
                }
                src.linkGroupId=copy.linkGroupId;
                persistPlantData();
                renderDashboard();
                renderSatelliteZones();
                updateDropdowns();
                refreshZoneLinkOptions();
                document.getElementById('transferStatus').textContent=
                    'Transferred '+src.name+' using the 4-point registration. Check the boundary at close zoom; repeat registration if it is offset.';
                switchMapView('satellite');
                setTimeout(() => {
                    if (copy.type==='marker') satelliteMap.setView([copy.latlng.lat,copy.latlng.lng], Math.max(17,satelliteMap.getZoom()));
                    else {
                        const layer=copy.type==='polyline' ? L.polyline(copy.latlngs) : L.polygon(copy.latlngs);
                        satelliteMap.fitBounds(layer.getBounds(),{padding:[40,40],maxZoom:19});
                    }
                },220);
            } catch (error) {
                alert('Zone transfer failed: '+error.message);
            }
        }

        function cancelZoneAlignment() { zoneAlignment={active:false,phase:'source',pairs:[],pendingSource:null}; document.getElementById('transferStatus').textContent='Alignment cancelled. No map geometry was changed.'; }

        // --- INDEPENDENT CONNECTION ROUTES (engineering vs geographical) ---
        function toggleConnectionPanel() {
            document.getElementById('transferPanel').classList.remove('visible');
            document.getElementById('satellitePanel').classList.remove('visible');
            document.getElementById('connectionPanel').classList.toggle('visible');
        }
        function activeConnectionLayer() { return currentMapView === 'engineering' ? engineeringConnectionLayer : satelliteConnectionLayer; }
        function activeMapInstance() { return currentMapView === 'engineering' ? map : satelliteMap; }
        function routeColor(route) { return route.color || '#f1d44d'; }
        function updateConnectionStatus(message) {
            const count = connectionRoutes.filter(r => r.mapType === currentMapView).length;
            document.getElementById('connectionStatus').textContent = message || ('Current map: ' + (currentMapView === 'engineering' ? 'Engineering drawing' : 'Satellite map') + ' · ' + count + ' saved route(s).');
            document.getElementById('finishConnectionBtn').disabled = !connectionDrawing || pendingConnectionPoints.length < 2;
            document.getElementById('cancelConnectionBtn').disabled = !connectionDrawing;
        }
        function startConnectionDrawing() {
            if (currentMapView === 'satellite' && !satelliteMap) initializeSatelliteMap();
            connectionDrawing = true; connectionEditing = false; pendingConnectionPoints = [];
            const layer = activeConnectionLayer();
            if (layer) layer.eachLayer(l => { if (l._pendingConnection) layer.removeLayer(l); });
            updateConnectionStatus('Drawing mode: tap the map to add route points. Add bends wherever needed.');
            activeMapInstance().doubleClickZoom.disable();
        }
        function addConnectionPoint(latlng) {
            if (!connectionDrawing) return;
            pendingConnectionPoints.push([latlng.lat, latlng.lng]);
            const layer = activeConnectionLayer();
            if (window.pendingRoutePreview) layer.removeLayer(window.pendingRoutePreview);
            if (pendingConnectionPoints.length > 1) {
                window.pendingRoutePreview = L.polyline(pendingConnectionPoints, {color:'#f1d44d',weight:5,dashArray:'8,7',opacity:.95}).addTo(layer);
                window.pendingRoutePreview._pendingConnection = true;
            }
            updateConnectionStatus(pendingConnectionPoints.length + ' point(s) added. Add more bends or finish the route.');
        }
        function finishConnectionDrawing() {
            if (!connectionDrawing || pendingConnectionPoints.length < 2) return alert('Add at least two points to create a route.');
            const name = prompt('Enter a route / conveyor name:');
            if (!name) return;
            if (window.pendingRoutePreview && activeConnectionLayer()) activeConnectionLayer().removeLayer(window.pendingRoutePreview);
            connectionRoutes.push({ id:'route_' + Date.now(), name:name.trim(), mapType:currentMapView, points:pendingConnectionPoints.map(p=>[...p]), color:'#f1d44d', direction:true });
            localStorage.setItem('plant_connection_routes_v1', JSON.stringify(connectionRoutes));
            connectionDrawing = false; pendingConnectionPoints = []; window.pendingRoutePreview = null;
            activeMapInstance().doubleClickZoom.enable(); renderConnectionRoutes();
            updateConnectionStatus('Route saved independently on this map.');
        }
        function cancelConnectionDrawing() {
            if (window.pendingRoutePreview && activeConnectionLayer()) activeConnectionLayer().removeLayer(window.pendingRoutePreview);
            window.pendingRoutePreview = null; pendingConnectionPoints = []; connectionDrawing = false;
            if (activeMapInstance()) activeMapInstance().doubleClickZoom.enable();
            updateConnectionStatus('Route drawing cancelled.');
        }
        function renderConnectionRoutes() {
            if (engineeringConnectionLayer) engineeringConnectionLayer.clearLayers();
            if (satelliteConnectionLayer) satelliteConnectionLayer.clearLayers();
            connectionRoutes.forEach(route => {
                const target = route.mapType === 'engineering' ? engineeringConnectionLayer : satelliteConnectionLayer;
                if (!target || !route.points || route.points.length < 2) return;
                const line = L.polyline(route.points, {color:routeColor(route),weight:4,opacity:.95,dashArray:'10,6',interactive:true}).addTo(target);
                line.routeId = route.id;
                line.bindTooltip(route.name, {sticky:true, className:'connection-route-label'});
                if (route.direction) {
                    const mid = route.points[Math.floor(route.points.length/2)];
                    L.circleMarker(mid,{radius:4,color:'#fff',weight:1,fillColor:routeColor(route),fillOpacity:1,interactive:false}).addTo(target);
                }
            });
        }
        function persistEditedConnections(event) {
            event.layers.eachLayer(layer => {
                const route = connectionRoutes.find(r => r.id === layer.routeId);
                if (route) route.points = layer.getLatLngs().map(p => [p.lat,p.lng]);
            });
            localStorage.setItem('plant_connection_routes_v1', JSON.stringify(connectionRoutes));
            renderConnectionRoutes(); updateConnectionStatus('Edited route geometry saved.');
        }
        function toggleConnectionEditing() {
            const control = currentMapView === 'engineering' ? engineeringEditControl : satelliteEditControl;
            if (!control) return;
            // Leaflet.draw exposes the edit toolbar through its control; clicking the pencil
            // button enables vertex handles for routes on the currently active map only.
            updateConnectionStatus('Use the pencil control on the map toolbar to drag route vertices, then save the edit.');
        }

        // --- DATABASE SETUP (v4) ---
        // Incrementing storage key to avoid breaking changes with old schemas
        let zones = JSON.parse(localStorage.getItem('plant_zones_v4')) || [];
        let workers = JSON.parse(localStorage.getItem('plant_workers_v4')) || [];
        
        function persistPlantData() {
            try {
                localStorage.setItem('plant_zones_v4', JSON.stringify(zones));
                localStorage.setItem('plant_workers_v4', JSON.stringify(workers));
                localStorage.setItem('plant_satellite_zones_v1', JSON.stringify(satelliteZones));
                localStorage.setItem('plant_connection_routes_v1', JSON.stringify(connectionRoutes));
                return true;
            } catch (err) {
                console.error('Plant Tracker save failed:', err);
                const status = document.getElementById('zoneLinkStatus') || document.getElementById('plantLocationStatus');
                if (status) status.textContent = 'Could not save locally. Browser storage may be full or unavailable. Export/backup your data before continuing.';
                return false;
            }
        }
        function saveToDatabase() {
            const saved = persistPlantData();
            renderDashboard();
            refreshTransferZoneOptions();
            refreshZoneLinkOptions();
            if (satelliteMap) renderSatelliteZones();
            if (!saved) console.warn('Changes are currently only in memory and were not persisted.');
        }

        // --- MAP INITIALIZATION ---
        const map = L.map('map', { crs: L.CRS.Simple, minZoom: -2, maxZoom: 4 });
        const imgWidth = 1176; const imgHeight = 1536; // F_D1.jpg natural pixel dimensions; preserve its aspect ratio 
        const bounds = [[0, 0], [imgHeight, imgWidth]];
        
        L.imageOverlay('F_D1.jpg', bounds).addTo(map);
        map.fitBounds(bounds);
        engineeringConnectionLayer = new L.FeatureGroup().addTo(map);
        map.on('click', function(event) {
            if (zoneAlignment.active && currentMapView==='engineering') { captureEngineeringAlignmentPoint(event.latlng); return; }
            if (connectionDrawing && currentMapView==='engineering') addConnectionPoint(event.latlng);
        });
        engineeringEditControl = new L.Control.Draw({ draw:false, edit:{ featureGroup:engineeringConnectionLayer, remove:false } });
        map.addControl(engineeringEditControl);
        map.on(L.Draw.Event.EDITED, persistEditedConnections);
        renderConnectionRoutes();

        function updateMapZoomClass() {
            const currentZoom = map.getZoom();
            const mapContainer = document.getElementById('map');
            
            mapContainer.classList.remove('zoom-level-out', 'zoom-level-mid');
            
            if (currentZoom < -1) {
                mapContainer.classList.add('zoom-level-out');
            } else if (currentZoom === -1) {
                mapContainer.classList.add('zoom-level-mid');
            }
        }
        
        map.on('zoomend', updateMapZoomClass);
        map.on('zoomend moveend', layoutEngineeringBadges);
        updateMapZoomClass(); 

        // --- DRAWING TOOLS ---
        var drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        
        var drawControl = new L.Control.Draw({
            draw: {
                circle: false, circlemarker: false, marker: true,
                polygon: { shapeOptions: { color: '#4da8da', weight: 2, fillOpacity: 0.2 } },
                rectangle: { shapeOptions: { color: '#4da8da', weight: 2, fillOpacity: 0.2 } },
                polyline: { 
                    shapeOptions: { color: '#00ff00', weight: 4, dashArray: '10, 14', opacity: 0.9 },
                    icon: new L.DivIcon({ iconSize: new L.Point(8, 8), className: 'leaflet-div-icon' })
                }
            },
            edit: { featureGroup: drawnItems }
        });
        map.addControl(drawControl);
        map.on(L.Draw.Event.EDITED, onEngineeringZonesEdited);

        map.on(L.Draw.Event.CREATED, function (e) {
            var type = e.layerType, layer = e.layer;
            var zoneName = prompt("Enter a name for this Location/Route:");
            if (!zoneName) return; 

            // Initialize new zones with empty symbol
            let newZone = { id: 'z_' + Date.now(), name: zoneName, type: type, status: 'running', symbol: '' };
            if (type === 'marker') { newZone.latlng = layer.getLatLng(); } 
            else { newZone.latlngs = layer.getLatLngs(); }
            
            zones.push(newZone);
            saveToDatabase();
        });

        map.on(L.Draw.Event.DELETED, function (e) {
            e.layers.eachLayer(function (layer) {
                if (layer.zoneId) {
                    zones = zones.filter(z => z.id !== layer.zoneId);
                    workers.forEach(w => { if(w.zoneId === layer.zoneId) w.zoneId = null; });
                }
            });
            saveToDatabase();
        });

        // --- SATELLITE MAP: FULLY EDITABLE SITE ZONES ---
        function onSatelliteZoneCreated(e) {
            const name = prompt('Name this site area / equipment / route:');
            if (!name) return;
            const layer = e.layer, type = e.layerType;
            const item = { id:'sz_' + Date.now(), name:name.trim(), type, status:'running', symbol:'', mapType:'satellite' };
            if (type === 'marker') item.latlng = layer.getLatLng();
            else item.latlngs = layer.getLatLngs();
            satelliteZones.push(item);
            persistPlantData();
            renderSatelliteZones();
            updateDropdowns();
            refreshZoneLinkOptions();
        }
        function onSatelliteZonesEdited(e) {
            e.layers.eachLayer(layer => {
                const z = satelliteZones.find(x => x.id === layer.zoneId);
                if (!z) return;
                if (z.type === 'marker') {
                    const ll = layer.getLatLng();
                    z.latlng = {lat:ll.lat, lng:ll.lng};
                } else {
                    z.latlngs = layer.getLatLngs();
                }
            });
            persistPlantData();
            renderSatelliteZones();
        }
        function onSatelliteZonesDeleted(e) {
            e.layers.eachLayer(layer => {
                if (layer.zoneId) {
                    const removed = satelliteZones.find(z => z.id === layer.zoneId);
                    if (removed && removed.linkGroupId) zones.forEach(peer => { if (peer.linkGroupId === removed.linkGroupId) delete peer.linkGroupId; });
                    satelliteZones = satelliteZones.filter(z => z.id !== layer.zoneId);
                    workers.forEach(w => { if (w.zoneId === layer.zoneId) w.zoneId = null; });
                }
            });
            saveToDatabase();
        }
        // Badge anchors are independent from zone geometry. Users can drag each
        // operational badge to the exact equipment point they want to represent.
        // Engineering anchors are stored in CRS.Simple drawing coordinates as {lat,lng};
        // satellite anchors are geographic coordinates in the same object shape.
        function validBadgeAnchor(anchor) {
            return !!anchor && Number.isFinite(Number(anchor.lat)) && Number.isFinite(Number(anchor.lng));
        }
        function makeBadgeDraggable(marker, zone, mapInstance, storageKind) {
            marker.options.draggable = true;
            marker.dragging.enable();
            marker.on('dragend', function () {
                const p = marker.getLatLng();
                zone.badgeAnchor = { lat:p.lat, lng:p.lng };
                zone.badgeAnchorMode = 'manual';
                marker._badgeAnchor = L.latLng(p.lat,p.lng);
                if (storageKind === 'engineering') {
                    persistPlantData();
                } else {
                    localStorage.setItem('plant_satellite_zones_v1', JSON.stringify(satelliteZones));
                }
                const status = document.getElementById(storageKind === 'engineering' ? 'zoneLinkStatus' : 'transferStatus');
                if (status) status.textContent = 'Badge position saved for ' + zone.name + '.';
            });
            marker.bindTooltip('Drag to reposition this zone badge', {direction:'top', opacity:.9});
            return marker;
        }

        function polygonCentroidLatLngs(latlngs) {
            // Leaflet CRS.Simple: x = lng, y = lat. Polygon area centroid,
            // with bounds-centre fallback for degenerate/complex geometry.
            const ring = Array.isArray(latlngs) && Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
            if (!Array.isArray(ring) || ring.length < 3) return null;
            let area2=0, cx=0, cy=0;
            for (let i=0,j=ring.length-1; i<ring.length; j=i++) {
                const a=ring[j], b=ring[i];
                const ax=Number(a.lng ?? a[1]), ay=Number(a.lat ?? a[0]);
                const bx=Number(b.lng ?? b[1]), by=Number(b.lat ?? b[0]);
                const cross=ax*by-bx*ay;
                area2+=cross; cx+=(ax+bx)*cross; cy+=(ay+by)*cross;
            }
            if (Math.abs(area2)<1e-9) return null;
            return L.latLng(cy/(3*area2), cx/(3*area2));
        }

        function defaultEngineeringBadgeAnchor(zone, shapeLayer, fallback) {
            if (zone.badgeAnchorMode === 'manual' && validBadgeAnchor(zone.badgeAnchor)) return L.latLng(Number(zone.badgeAnchor.lat), Number(zone.badgeAnchor.lng));
            if ((zone.type==='polygon' || zone.type==='rectangle') && zone.latlngs) {
                const c=polygonCentroidLatLngs(zone.latlngs);
                if (c) return c;
            }
            return fallback ? L.latLng(fallback) : shapeLayer.getBounds().getCenter();
        }

        function defaultSatelliteBadgeAnchor(zone, fallback) {
            if (zone.badgeAnchorMode === 'manual' && validBadgeAnchor(zone.badgeAnchor)) return L.latLng(Number(zone.badgeAnchor.lat), Number(zone.badgeAnchor.lng));
            return fallback ? L.latLng(fallback) : null;
        }

        function renderSatelliteZones() {
            if (!satelliteMap || !satelliteDrawnItems) return;
            satelliteDrawnItems.clearLayers();
            Object.values(satelliteZoneBadgeMarkers).forEach(m => satelliteMap.removeLayer(m));
            satelliteZoneBadgeMarkers = {};
            const assigned = {};
            satelliteZones.forEach(z => assigned[z.id] = []);
            workers.forEach(w => {
                if (!w.zoneId) return;
                const assignedZone = [...zones, ...satelliteZones].find(item => item.id === w.zoneId);
                const groupId = assignedZone && assignedZone.linkGroupId;
                satelliteZones.forEach(target => {
                    if (target.id === w.zoneId || (groupId && target.linkGroupId === groupId)) assigned[target.id].push(w);
                });
            });
            satelliteZones.forEach(z => {
                const linkedPeer = z.linkGroupId ? zones.find(peer => peer.linkGroupId === z.linkGroupId) : null;
                const status = (linkedPeer && linkedPeer.status) || z.status || 'running';
                const color = status === 'running' ? '#00d66b' : status === 'maintenance' ? '#ffaa00' : '#ff3030';
                let shape, center;
                if (z.type === 'marker') {
                    center = z.latlng;
                    shape = L.circleMarker(center, {radius:9,color,weight:3,fillColor:color,fillOpacity:.45});
                } else if (z.type === 'polyline') {
                    shape = L.polyline(z.latlngs, {color,weight:5,dashArray:'10,8',opacity:.95});
                    center = shape.getBounds().getCenter();
                } else {
                    shape = L.polygon(z.latlngs, {color,weight:3,fillColor:color,fillOpacity:.18});
                    center = shape.getBounds().getCenter();
                }
                shape.zoneId = z.id;
                shape.bindTooltip((z.symbol ? z.symbol + ' ' : '') + z.name, {sticky:true});
                satelliteDrawnItems.addLayer(shape);
                if (z.type !== 'polyline' || (assigned[z.id] || []).length) {
                    const people = assigned[z.id] || [];
                    const workersHtml = people.length ? '<div class="badge-workers">' + people.map(w => `<div class="worker-item"><span>${escapeHtml(w.name)}</span><span>${escapeHtml(w.role)}</span></div>`).join('') + '</div>' : '';
                    const linkedTag = z.linkGroupId ? '<span class="linked-zone-tag">LINKED ZONE</span>' : '';
                    const html = `<div class="manpower-badge"><div class="badge-header"><span class="led led-${status}"></span><span class="machine-symbol">${z.symbol || ''}</span><span class="badge-zone">${escapeHtml(z.name)}</span></div><div class="badge-count">${people.length} Personnel</div>${linkedTag}${workersHtml}<span class="badge-drag-note">DRAG TO POSITION</span></div>`;
                    const badgeAnchor=defaultSatelliteBadgeAnchor(z,center);
                    const icon = L.divIcon({className:'transparent-icon',iconSize:[0,0],iconAnchor:[0,0],html});
                    const badgeMarker=L.marker(badgeAnchor,{icon,interactive:true,draggable:true,bubblingMouseEvents:false}).addTo(satelliteMap);
                    badgeMarker._badgeAnchor=badgeAnchor;
                    makeBadgeDraggable(badgeMarker,z,satelliteMap,'satellite');
                    satelliteZoneBadgeMarkers[z.id] = badgeMarker;
                }
            });
            layoutSatelliteBadges();
        }

        function updateSatelliteBadgeScale() {
            if (!satelliteMap) return;
            const zoom = satelliteMap.getZoom();
            // Keep badges readable on mobile while gently scaling with map zoom.
            const scale = Math.max(0.72, Math.min(1.18, Math.pow(1.12, zoom - 16)));
            document.querySelectorAll('#satellite-map .manpower-badge').forEach(el => {
                el.style.setProperty('--badge-scale', String(scale));
            });
        }
        function layoutSatelliteBadges() {
            // Deliberately do not auto-offset badges. Their stored geographic
            // anchor is the exact point selected by the user and must remain fixed
            // through map pan/zoom. Leaflet itself keeps the marker in map space.
            Object.values(satelliteZoneBadgeMarkers).forEach(marker => {
                if (marker._badgeAnchor) marker.setLatLng(marker._badgeAnchor);
            });
        }
        function escapeHtml(value) { return String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
        function findZoneById(id) { return zones.find(z => z.id === id) || satelliteZones.find(z => z.id === id); }

        // --- STATUS & SETTINGS LOGIC ---
        function loadZoneSettings() {
            const zId = document.getElementById('settingZoneSelect').value;
            const z = findZoneById(zId);
            if(z) { 
                document.getElementById('zoneStatusSelect').value = z.status || 'running';
                document.getElementById('zoneSymbolSelect').value = z.symbol || '';
            }
        }

        function updateZoneStatus() {
            const zId = document.getElementById('settingZoneSelect').value;
            const newStatus = document.getElementById('zoneStatusSelect').value;
            const newSymbol = document.getElementById('zoneSymbolSelect').value;
            
            if(!zId) return alert('Select a zone first.');
            
            const z = findZoneById(zId);
            if(z) {
                const linkedId = z.linkGroupId;
                const all = [...zones, ...satelliteZones];
                const targets = linkedId ? all.filter(item => item.linkGroupId === linkedId) : [z];
                targets.forEach(item => {
                    item.status = newStatus;
                    item.symbol = newSymbol;
                });
                saveToDatabase();
            }
        }

        // --- RENDER LOGIC ---
        let badgeMarkers = {}; 

        function renderDashboard() { 
            updateDropdowns();
            refreshTransferZoneOptions();
            renderWorkerList(); 
            renderMapMarkers();
            if (satelliteMap) renderSatelliteZones();
        }
        
        function renderMapMarkers() {
            drawnItems.clearLayers();
            Object.values(badgeMarkers).forEach(m => map.removeLayer(m));
            badgeMarkers = {};
            
            const zoneWorkers = {};
            zones.forEach(z => zoneWorkers[z.id] = []);
            workers.forEach(w => {
                if (!w.zoneId) return;
                const assignedZone = [...zones, ...satelliteZones].find(item => item.id === w.zoneId);
                const groupId = assignedZone && assignedZone.linkGroupId;
                zones.forEach(target => {
                    if (target.id === w.zoneId || (groupId && target.linkGroupId === groupId)) zoneWorkers[target.id].push(w);
                });
            });
            
            zones.forEach(zone => {
                let centerPoint;
                let shapeLayer;
                
                const stat = zone.status || 'running';
                let baseColor = stat === 'running' ? '#00ff00' : (stat === 'maintenance' ? '#ffaa00' : '#ff0000');
                let cssClass = '';
                
                if (stat === 'running') {
                    if (zone.type === 'polyline') cssClass = 'flowing-line';
                    else if (zone.type === 'polygon' || zone.type === 'rectangle') cssClass = 'pulsing-zone';
                }

                if (zone.type === 'marker') {
                    centerPoint = [zone.latlng.lat, zone.latlng.lng];
                    shapeLayer = L.circleMarker(centerPoint, { radius: 8, color: baseColor, fillOpacity: 0.8, className: cssClass });
                } else if (zone.type === 'polyline') {
                    shapeLayer = L.polyline(zone.latlngs, {color: baseColor, weight: 4, dashArray: '10, 14', opacity: 0.9, className: cssClass});
                    centerPoint = shapeLayer.getBounds().getCenter(); 
                } else if (zone.type === 'polygon' || zone.type === 'rectangle') {
                    shapeLayer = L.polygon(zone.latlngs, {color: baseColor, weight: 2, fillOpacity: 0.15, className: cssClass});
                    centerPoint = shapeLayer.getBounds().getCenter();
                }

                if(shapeLayer) {
                    shapeLayer.zoneId = zone.id;
                    drawnItems.addLayer(shapeLayer);
                }
                
                const assignedWorkers = zoneWorkers[zone.id];
                const count = assignedWorkers.length;
                
                if (zone.type !== 'polyline' || count > 0) {
                    
                    let workersHtml = '';
                    if (count > 0) {
                        const items = assignedWorkers.map(w => `<div class="worker-item"><span>${w.name}</span> <span style="color:#4da8da; font-size:10px;">${w.role}</span></div>`).join('');
                        workersHtml = `<div class="badge-workers">${items}</div>`;
                    }
                    
                    // Render the symbol if it exists for this zone
                    let symbolHtml = zone.symbol ? `<div class="machine-symbol">${zone.symbol}</div>` : '';
                    
                    const badgeIcon = L.divIcon({
                        className: 'transparent-icon', iconSize: [0, 0], iconAnchor: [0, 0], 
                        html: `
                            <div class="manpower-badge">
                                <div class="badge-header">
                                    <div class="led led-${stat}"></div>
                                    ${symbolHtml}
                                    <div class="badge-zone">${zone.name}</div>
                                </div>
                                <div class="badge-count">${count} Personnel Active</div>
                                ${workersHtml}<span class="badge-drag-note">DRAG TO POSITION</span>
                            </div>`
                    });
                    
                    if (centerPoint) {
                        const badgeAnchor=defaultEngineeringBadgeAnchor(zone,shapeLayer,centerPoint);
                        badgeMarkers[zone.id] = L.marker(badgeAnchor, { icon: badgeIcon, interactive: true, draggable: true, bubblingMouseEvents:false }).addTo(map);
                        badgeMarkers[zone.id]._badgeAnchor = L.latLng(badgeAnchor);
                        makeBadgeDraggable(badgeMarkers[zone.id],zone,map,'engineering');
                    }
                }
            });
            layoutEngineeringBadges();
        }
        
        function layoutEngineeringBadges() {
            // Badge markers are anchored to saved drawing coordinates. Never
            // shift them to avoid collisions; let the user drag them to the
            // intended equipment location inside each zone.
            Object.values(badgeMarkers).forEach(marker => {
                if (marker._badgeAnchor) marker.setLatLng(marker._badgeAnchor);
            });
        }

        function onEngineeringZonesEdited(e) {
            e.layers.eachLayer(layer => {
                const z = zones.find(item => item.id === layer.zoneId);
                if (!z) return;
                if (z.type === 'marker') {
                    const ll = layer.getLatLng();
                    z.latlng = {lat:ll.lat, lng:ll.lng};
                } else {
                    z.latlngs = layer.getLatLngs();
                }
            });
            saveToDatabase();
        }

        function updateDropdowns() {
            const setSelect = document.getElementById('settingZoneSelect');
            const assignSelect = document.getElementById('assignZoneSelect');
            
            setSelect.innerHTML = '<option value="">-- Select Machine/Zone --</option>';
            assignSelect.innerHTML = '<option value="">-- Select Location --</option>';
            
            [...zones.map(z => ({...z, _map:'Engineering'})), ...satelliteZones.map(z => ({...z, _map:'Satellite'}))].forEach(z => {
                // Use the custom symbol in the dropdown if available, otherwise default to line/pin
                let displayIcon = z.symbol ? z.symbol + ' ' : (z.type === 'polyline' ? '🔗 ' : '📍 ');
                
                let opt1 = document.createElement('option'); opt1.value = z.id; opt1.textContent = displayIcon + z._map + ' · ' + z.name;
                let opt2 = document.createElement('option'); opt2.value = z.id; opt2.textContent = displayIcon + z._map + ' · ' + z.name;
                
                setSelect.appendChild(opt1);
                assignSelect.appendChild(opt2);
            });
        }

        function renderWorkerList() {
            const listDiv = document.getElementById('workerList');
            listDiv.innerHTML = '';
            
            if(workers.length === 0) {
                listDiv.innerHTML = '<p style="color:#666; font-size:13px; font-style:italic;">No workers active.</p>';
            }
            
            workers.forEach((worker, index) => {
                let optionsHtml = '<option value="">-- Reassign --</option>';
                optionsHtml += [...zones, ...satelliteZones].map(z => {
                    let displayIcon = z.symbol ? z.symbol + ' ' : '';
                    return `<option value="${z.id}" ${worker.zoneId === z.id ? 'selected' : ''}>${displayIcon}${z.name}</option>`
                }).join('');
                
                const card = document.createElement('div');
                card.className = 'worker-card';
                card.innerHTML = `
                    <div class="worker-name">${worker.name} <span class="role-tag">${worker.role}</span></div>
                    <select onchange="updateWorkerZone(${index}, this.value)">${optionsHtml}</select>
                `;
                listDiv.appendChild(card);
            });
        }
        
        // --- ACTIONS ---
        function addWorker() {
            const nameInput = document.getElementById('workerName');
            const roleSelect = document.getElementById('workerRole');
            const zoneSelect = document.getElementById('assignZoneSelect');
            
            if (nameInput.value.trim() === '') return alert('Enter a worker name');
            if (zoneSelect.value === '') return alert('Please select a location.');
            
            workers.push({ id: Date.now(), name: nameInput.value.trim(), role: roleSelect.value, zoneId: zoneSelect.value });
            nameInput.value = '';
            saveToDatabase();
        }
        
        function updateWorkerZone(workerIndex, newZoneId) { workers[workerIndex].zoneId = newZoneId; saveToDatabase(); }
        
        function clearData() { 
            if(confirm('WARNING: Delete all machines, settings, and worker data?')) { 
                workers = []; zones = []; saveToDatabase(); 
            } 
        }
        
        renderDashboard();
    