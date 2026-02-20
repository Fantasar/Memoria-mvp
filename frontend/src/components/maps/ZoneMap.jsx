import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useRef, useMemo, useState } from 'react';

const libraries = ['marker'];

function ZoneMap({ cemeteries }) {
  console.log('🗺️ ZoneMap CHARGÉ - cemeteries:', cemeteries);
  console.log('🗺️ Nombre de cimeteries:', cemeteries?.length);

  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false); // ✅ AJOUTE

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  console.log('🔑 Google Maps isLoaded:', isLoaded);

  const center = useMemo(() => {
    if (cemeteries.length > 0 && cemeteries[0].latitude && cemeteries[0].longitude) {
      return { 
        lat: parseFloat(cemeteries[0].latitude), 
        lng: parseFloat(cemeteries[0].longitude) 
      };
    }
    return { lat: 44.8378, lng: -0.5792 };
  }, [cemeteries]);

  const onLoad = (map) => {
    console.log('🗺️ onLoad APPELÉ - Map chargée !', map);
    mapRef.current = map;
    setMapLoaded(true); // ✅ DÉCLENCHE le useEffect
  };

  // ✅ Utilise mapLoaded au lieu de mapRef.current
  useEffect(() => {
    console.log('🔄 useEffect DÉCLENCHÉ');
    console.log('  isLoaded:', isLoaded);
    console.log('  mapLoaded:', mapLoaded);
    console.log('  mapRef.current:', mapRef.current);

    if (!isLoaded || !mapLoaded || !mapRef.current) {
      console.log('⏸️ useEffect ARRÊTÉ - conditions non remplies');
      return;
    }

    console.log('✅ useEffect CONTINUE - création markers');

    // Nettoyer les anciens markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let markerCount = 0;

    cemeteries.forEach(cemetery => {
      console.log(`📍 Traitement: ${cemetery.name}, Lat: ${cemetery.latitude}, Lng: ${cemetery.longitude}`);

      if (!cemetery.latitude || !cemetery.longitude) {
        console.warn(`⚠️ Pas de coordonnées pour: ${cemetery.name}`);
        return;
      }

      const position = { 
        lat: parseFloat(cemetery.latitude), 
        lng: parseFloat(cemetery.longitude) 
      };

      const marker = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        title: `${cemetery.name} - ${cemetery.city}`,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });

      console.log(`✅ Marker créé pour: ${cemetery.name}`);

      markersRef.current.push(marker);
      bounds.extend(position);
      markerCount++;
    });

    console.log(`📊 Total markers créés: ${markerCount}`);

    if (markerCount > 0) {
      console.log('🔍 Ajustement du zoom avec fitBounds');
      mapRef.current.fitBounds(bounds);
    }

    return () => {
      console.log('🧹 Nettoyage markers');
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, [isLoaded, mapLoaded, cemeteries]); // ✅ AJOUTE mapLoaded

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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