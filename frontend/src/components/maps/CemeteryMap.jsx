// frontend/src/components/maps/CemeteryMap.jsx
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useRef, useMemo, useState } from 'react';

const LIBRARIES = ['marker'];
const DEFAULT_CENTER = { lat: 44.8378, lng: -0.5792 };

/**
 * Carte interactive pour sélectionner un cimetière lors d'une commande.
 * Le marqueur du cimetière sélectionné est mis en rouge, les autres en vert.
 *
 * @param {Array}    cemeteries  - Liste des cimetières depuis la BDD
 * @param {string}   selectedId  - ID du cimetière actuellement sélectionné
 * @param {Function} onSelect    - Callback appelé au clic sur un marqueur
 */
function CemeteryMap({ cemeteries, selectedId, onSelect }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  const center = useMemo(() => {
    const first = cemeteries?.[0];
    if (first?.latitude && first?.longitude) {
      return { lat: parseFloat(first.latitude), lng: parseFloat(first.longitude) };
    }
    return DEFAULT_CENTER;
  }, [cemeteries]);

  const onLoad = (map) => {
    mapRef.current = map;
    setMapLoaded(true);
  };

  useEffect(() => {
    console.log('Cimetières reçus dans CemeteryMap:', cemeteries);
  }, [cemeteries]);

  useEffect(() => {
    if (!isLoaded || !mapLoaded || !mapRef.current) return;

    // Nettoie les anciens marqueurs
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let markerCount = 0;

    cemeteries?.forEach(cemetery => {
      if (!cemetery.latitude || !cemetery.longitude) return;

      const position = { lat: parseFloat(cemetery.latitude), lng: parseFloat(cemetery.longitude) };
      const isSelected = String(cemetery.id) === String(selectedId);

      const marker = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        title: `${cemetery.name} — ${cemetery.city}`,
        icon: {
          url: isSelected
            ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });

      // Clic sur le marqueur → sélectionne le cimetière
      marker.addListener('click', () => onSelect(cemetery));

      markersRef.current.push(marker);
      bounds.extend(position);
      markerCount++;
    });

    if (markerCount > 0) mapRef.current.fitBounds(bounds);

    return () => markersRef.current.forEach(m => m.setMap(null));
  }, [isLoaded, mapLoaded, cemeteries, selectedId, onSelect]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <GoogleMap
      center={center}
      zoom={10}
      mapContainerStyle={{ width: '100%', height: '350px', borderRadius: '0.5rem' }}
      onLoad={onLoad}
    />
  );
}

export default CemeteryMap;