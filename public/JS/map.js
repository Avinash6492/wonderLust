
const { token, title, coordinates } = window.mapConfig;

const mapContainer = document.getElementById("map");
if (!mapContainer || !token || !Array.isArray(coordinates) || coordinates.length !== 2) {
    if (mapContainer) {
        mapContainer.innerHTML = "<p class='map-unavailable'>Map location is unavailable for this listing.</p>";
    }
} else {
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: coordinates,
        zoom: 9
    });

    map.addControl(new mapboxgl.NavigationControl());

    new mapboxgl.Marker()
        .setLngLat(coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 })
                .setText(title)
        )
        .addTo(map);
}
