// Inicializar mapa centrado en Bogotá (Antonio Nariño)
const map = L.map('map').setView([4.588, -74.095], 13);

// Agregar capa base de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let capaLocalidad = null;
let capaParaderos = null;

// Escuchar evento del botón Localidad
document.getElementById('btn-localidad').addEventListener('click', async () => {
    if (capaLocalidad) return; // Ya está cargada

    try {
        const respuesta = await fetch('../backend/loca.geojson');
        const data = await respuesta.json(); // Formato ArcGIS JSON
        
        // Filtrar localidad para que sea SOLO Antonio Nariño (LocCodigo 15 o por nombre)
        const antonioNarino = data.features.filter(f => 
            f.attributes.LocCodigo === "15" || 
            (f.attributes.LocNombre && f.attributes.LocNombre.includes("ANTONIO"))
        );
        
        // Convertir ArcGIS JSON a estándar GeoJSON
        const geojsonFeatures = antonioNarino.map(f => ({
            type: "Feature",
            properties: f.attributes,
            geometry: {
                type: "Polygon",
                coordinates: f.geometry.rings
            }
        }));
        
        capaLocalidad = L.geoJSON(geojsonFeatures, {
            style: {
                color: '#e74c3c',
                weight: 3,
                fillOpacity: 0.15
            }
        }).addTo(map);
        
        map.fitBounds(capaLocalidad.getBounds());
    } catch (error) {
        console.error("Error al cargar la localidad:", error);
    }
});

// Escuchar evento del botón Paraderos
document.getElementById('btn-paradas').addEventListener('click', async () => {
    if (capaParaderos) return; // Ya está cargada

    try {
        const respuesta = await fetch('../backend/paraderos.json');
        const data = await respuesta.json();
        
        capaParaderos = L.layerGroup().addTo(map);
        
        // Filtrar para mostrar SOLO los paraderos de Antonio Nariño (Localidad 15)
        const paraderosAntonioNarino = data.features.filter(p => 
            p.attributes.localidad_ === 15 || p.attributes.localidad_ === "15"
        );

        paraderosAntonioNarino.forEach(paradero => {
            if (paradero.geometry && paradero.attributes) {
                const lat = paradero.geometry.y;
                const lng = paradero.geometry.x;
                const nombre = paradero.attributes.nombre_par || "Paradero";
                const direccion = paradero.attributes.direccion_ || "Sin dirección";
                const panel = paradero.attributes.panel_para || "";
                
                const marker = L.circleMarker([lat, lng], {
                    radius: 6,
                    fillColor: "#3498db",
                    color: "#fff",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
                
                marker.bindPopup(`
                    <div style="text-align: center;">
                        <b>${nombre}</b><br>
                        <hr style="margin: 5px 0;">
                        📍 ${direccion}<br>
                        🪧 ${panel}
                    </div>
                `);
                
                capaParaderos.addLayer(marker);
            }
        });
    } catch (error) {
        console.error("Error al cargar los paraderos:", error);
    }
});