export const formatCoordinates = (coordinates: number[]): string => {
    return coordinates.join(', ');
};

export const handleMapClick = (event: any, map: any) => {
    const { lat, lng } = event.latlng;
    console.log(`Map clicked at: Latitude: ${lat}, Longitude: ${lng}`);
};

export const processGeoJSON = (geojson: any) => {
    // Process GeoJSON data and return relevant features
    return geojson.features.map((feature: any) => ({
        type: feature.geometry.type,
        coordinates: feature.geometry.coordinates,
        properties: feature.properties,
    }));
};