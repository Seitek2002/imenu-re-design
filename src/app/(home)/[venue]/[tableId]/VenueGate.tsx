'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { canonicalizeVenueSlug } from '@/lib/utils/slug';

const VenueGate = () => {
  const params = useParams<{ tableId: string; venue: string }>();
  const route = useRouter();

  useEffect(() => {
    if (params.tableId?.toLowerCase() === 'd') {
      // kiosk route handled at page level; do not redirect or save tableId
      return;
    }
    sessionStorage.setItem('tableId', params.tableId!);
    localStorage.setItem(
      'venueRoot',
      '/' + canonicalizeVenueSlug(params.venue!).toLowerCase()
    );
    route.push('/' + params.venue!.toLowerCase());
  }, []);

  return <div></div>;
};

export default VenueGate;
