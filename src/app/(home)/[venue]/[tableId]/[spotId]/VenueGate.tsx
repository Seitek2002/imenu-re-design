'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const VenueGate = () => {
  const params = useParams<{ tableId: string; venue: string, spotId: string }>();
  const route = useRouter();

  useEffect(() => {
    sessionStorage.setItem('tableId', params.tableId!);
    sessionStorage.setItem('spotId', params.spotId!);
    localStorage.setItem('venueRoot', params.venue!.toLowerCase());
    route.push('/' + params.venue!.toLowerCase());
  }, []);

  return <div></div>;
};

export default VenueGate;
