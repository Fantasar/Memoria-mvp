// frontend/src/components/maps/ZoneMap.jsx
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useRef, useMemo, useState } from 'react';

// Déclaré hors du composant pour éviter une nouvelle référence à chaque render
// ce qui forcerait useJsApiLoader à recharger l'API Google Maps
const LIBRARIES = ['marker'];

// Centre par défaut : Bordeaux (zone pilote Nouvelle-Aquitaine)
const DEFAULT_CENTER = { lat: 44.8378, lng: -0.5792 };

/**
 * Carte Google Maps affichant les cimetières de la zone d'intervention.
 * Ajuste automatiquement le zoom pour englober tous les marqueurs.
 *
 * @param {{ latitude, longitude, name, city }[]} cemeteries - Liste des cimetières à afficher
 */
function ZoneMap({ cemeteries }) {
  const mapRef     = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  // Centre initial sur le premier cimetière géocodé ou sur Bordeaux par défaut
  const center = useMemo(() => {
    const first = cemeteries?.[0];
    if (first?.latitude && first?.longitude) {
      return {
        lat: parseFloat(first.latitude),
        lng: parseFloat(first.longitude)
      };
    }
    return DEFAULT_CENTER;
  }, [cemeteries]);

  const onLoad = (map) => {
    mapRef.current = map;
    setMapLoaded(true);
  };

  // Place les marqueurs une fois la carte et l'API chargées
  useEffect(() => {
    if (!isLoaded || !mapLoaded || !mapRef.current) return;

    // Nettoie les anciens marqueurs avant d'en créer de nouveaux
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds      = new window.google.maps.LatLngBounds();
    let   markerCount = 0;

    cemeteries?.forEach(cemetery => {
      if (!cemetery.latitude || !cemetery.longitude) return;

      const position = {
        lat: parseFloat(cemetery.latitude),
        lng: parseFloat(cemetery.longitude)
      };

      const marker = new window.google.maps.Marker({
        position,
        map:   mapRef.current,
        title: `${cemetery.name} - ${cemetery.city}`,
        icon:  {
          url:        'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });

      markersRef.current.push(marker);
      bounds.extend(position);
      markerCount++;
    });

    // Ajuste le zoom pour englober tous les marqueurs
    if (markerCount > 0) {
      mapRef.current.fitBounds(bounds);
    }

    // Nettoyage au démontage du composant
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, [isLoaded, mapLoaded, cemeteries]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <GoogleMap
      center={center}
      zoom={11}
      mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '0.5rem' }}
      onLoad={onLoad}
    />
  );
}

export default ZoneMap;