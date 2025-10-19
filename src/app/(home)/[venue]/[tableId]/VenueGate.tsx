'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const VenueGate = () => {
  const params = useParams<{tableId: string; venue: string}>();
  const route = useRouter();

  useEffect(() => {
    localStorage.setItem('tableId', params.tableId!);
    localStorage.setItem('venueRoot', params.venue!);
    route.push(params.venue!)
  }, [])

  return (
    <div></div>
  )
}

export default VenueGate