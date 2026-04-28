'use client';

import { MutableRefObject, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import type { Coords } from '@/lib/osm-maps';

interface Props {
  initialCoords: Coords;
  onMoveEnd: (c: Coords) => void;
  onReady: () => void;
  flyToRef: MutableRefObject<((c: Coords) => void) | null>;
}

function MapEventHandler({
  onMoveEnd,
  onReady,
  flyToRef,
}: Omit<Props, 'initialCoords'>) {
  const map = useMapEvents({
    moveend() {
      const c = map.getCenter();
      onMoveEnd({ lat: c.lat, lng: c.lng });
    },
    load() {
      onReady();
    },
  });

  // Signal ready after first render (load event fires before react-leaflet mounts)
  useEffect(() => {
    onReady();
    flyToRef.current = (c: Coords) => {
      map.flyTo([c.lat, c.lng], 17, { duration: 0.4 });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function LeafletMap({ initialCoords, onMoveEnd, onReady, flyToRef }: Props) {
  return (
    <MapContainer
      center={[initialCoords.lat, initialCoords.lng]}
      zoom={15}
      className='absolute inset-0 h-full w-full'
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      <MapEventHandler
        onMoveEnd={onMoveEnd}
        onReady={onReady}
        flyToRef={flyToRef}
      />
    </MapContainer>
  );
}
