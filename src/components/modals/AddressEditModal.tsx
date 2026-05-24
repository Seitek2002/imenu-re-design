'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { ChevronLeft, MapPin } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import {
  useCreateMyAddress,
  useDeleteMyAddress,
  useUpdateMyAddress,
  type MyAddress,
  type MyAddressCreate,
} from '@/lib/api/addresses';
import DeliveryMapModal from '@/app/[venue]/cart/components/DeliveryMapModal';
import { getDeliveryGeo } from '@/lib/delivery';
import { useVenueStore } from '@/store/venue';
import type { Coords } from '@/lib/osm-maps';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** undefined → create flow; иначе — edit/delete. */
  address?: MyAddress | null;
}

const toCoordStr = (n: number): string => n.toFixed(6);

export default function AddressEditModal({ isOpen, onClose, address }: Props) {
  const mounted = useMounted();
  useEscapeKey(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <Form address={address ?? null} onClose={onClose} />,
    document.body,
  );
}

function Form({
  address,
  onClose,
}: {
  address: MyAddress | null;
  onClose: () => void;
}) {
  const t = useTranslations('AddressEdit');
  const venueData = useVenueStore((s) => s.data);
  const spotId = useVenueStore((s) => s.spotId);
  const { venueCoords, freeRadiusKm } = getDeliveryGeo(venueData, spotId);
  const freeDeliveryRadiusKm = freeRadiusKm > 0 ? freeRadiusKm : null;
  const deliveryFixedFee = parseFloat(venueData?.deliveryFixedFee || '0');

  const isEdit = !!address;
  const [label, setLabel] = useState(address?.label ?? '');
  const [street, setStreet] = useState(address?.address ?? '');
  const [coords, setCoords] = useState<Coords | null>(
    address
      ? { lat: Number(address.latitude), lng: Number(address.longitude) }
      : null,
  );
  const [entrance, setEntrance] = useState(address?.entrance ?? '');
  const [apartment, setApartment] = useState(address?.apartment ?? '');
  const [floor, setFloor] = useState(address?.floor ?? '');
  const [intercom, setIntercom] = useState(address?.intercom ?? '');
  const [comment, setComment] = useState(address?.comment ?? '');
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false);
  const [mapOpen, setMapOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCreateMyAddress();
  const update = useUpdateMyAddress();
  const del = useDeleteMyAddress();
  const busy = create.isPending || update.isPending || del.isPending;

  const handleSave = async () => {
    setError(null);
    if (!label.trim()) {
      setError(t('errorLabel'));
      return;
    }
    if (!street.trim() || !coords) {
      setError(t('errorMap'));
      return;
    }
    const body: MyAddressCreate = {
      label: label.trim(),
      address: street.trim(),
      latitude: toCoordStr(coords.lat),
      longitude: toCoordStr(coords.lng),
      entrance: entrance.trim() || null,
      apartment: apartment.trim() || null,
      floor: floor.trim() || null,
      intercom: intercom.trim() || null,
      comment: comment.trim() || null,
      isDefault,
    };
    try {
      if (isEdit && address) {
        await update.mutateAsync({ id: address.id, patch: body });
      } else {
        await create.mutateAsync(body);
      }
      onClose();
    } catch {
      setError(t('errorSave'));
    }
  };

  const handleDelete = async () => {
    if (!address) return;
    if (!window.confirm(t('deleteConfirm', { label: address.label }))) return;
    try {
      await del.mutateAsync(address.id);
      onClose();
    } catch {
      setError(t('errorDelete'));
    }
  };

  return (
    <div className='fixed inset-0 z-60 flex items-stretch justify-center'>
      <div
        className='absolute inset-0 bg-black/40'
        onClick={() => !busy && onClose()}
      />
      <div className='relative bg-white w-full max-w-175 mx-auto flex flex-col animate-in slide-in-from-bottom-4 duration-300'>
        <header className='sticky top-0 z-10 bg-white px-4 h-14 flex items-center border-b border-[#F1EEEB]'>
          <button
            type='button'
            onClick={onClose}
            disabled={busy}
            className='w-10 h-10 flex items-center justify-center rounded-full active:bg-[#F4F1EE] disabled:opacity-60'
            aria-label={t('close')}
          >
            <ChevronLeft size={24} />
          </button>
          <h3 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>
            {isEdit ? t('titleEdit') : t('titleCreate')}
          </h3>
        </header>

        <div className='flex-1 overflow-y-auto px-4 pt-4 pb-32 flex flex-col gap-4'>
          <FieldButton
            label={t('address')}
            value={street}
            placeholder={t('addressPlaceholder')}
            onClick={() => setMapOpen(true)}
            icon={
              <MapPin
                size={16}
                className={coords ? 'text-[#F3811F]' : 'text-[#A4A4A4]'}
              />
            }
          />

          <Field
            label={t('label')}
            value={label}
            onChange={setLabel}
            placeholder={t('labelPlaceholder')}
          />

          <div className='grid grid-cols-2 gap-2'>
            <Field label={t('floor')} value={floor ?? ''} onChange={setFloor} placeholder={t('floorPlaceholder')} />
            <Field label={t('entrance')} value={entrance ?? ''} onChange={setEntrance} placeholder={t('entrancePlaceholder')} />
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <Field
              label={t('apartment')}
              value={apartment ?? ''}
              onChange={setApartment}
              placeholder={t('apartmentPlaceholder')}
            />
            <Field
              label={t('intercom')}
              value={intercom ?? ''}
              onChange={setIntercom}
              placeholder={t('intercomPlaceholder')}
            />
          </div>

          <Field
            label={t('comment')}
            value={comment ?? ''}
            onChange={setComment}
            placeholder={t('commentPlaceholder')}
            textarea
          />

          <label className='flex items-center justify-between gap-3 text-[13px] text-[#21201F]'>
            <span>{t('isDefault')}</span>
            <input
              type='checkbox'
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className='w-5 h-5 accent-[#F3811F]'
            />
          </label>

          {error && (
            <div className='text-[12px] text-[#DC2626]'>{error}</div>
          )}
        </div>

        <div className='absolute bottom-0 left-0 right-0 bg-white border-t border-[#F1EEEB] px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] flex flex-col items-center gap-3'>
          {isEdit && (
            <button
              type='button'
              onClick={handleDelete}
              disabled={busy}
              className='text-[13px] text-[#E0533A] font-medium active:opacity-80 disabled:opacity-60'
            >
              {t('deleteAddress')}
            </button>
          )}
          <button
            type='button'
            onClick={handleSave}
            disabled={busy}
            className='w-full h-12 rounded-2xl bg-[linear-gradient(to_right,#FAA924_31%,#F3811F_71%)] text-white text-[14px] font-medium active:scale-[0.99] transition-transform disabled:opacity-60'
          >
            {t('save')}
          </button>
        </div>
      </div>

      <DeliveryMapModal
        open={mapOpen}
        initialCoords={coords}
        venueCoords={venueCoords}
        freeDeliveryRadiusKm={freeDeliveryRadiusKm}
        deliveryFixedFee={deliveryFixedFee}
        onClose={() => setMapOpen(false)}
        onConfirm={(c, addr) => {
          setCoords(c);
          if (addr) setStreet(addr);
          setMapOpen(false);
        }}
      />
    </div>
  );
}

function FieldButton({
  label,
  value,
  placeholder,
  onClick,
  icon,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <span className='text-[13px] text-[#21201F]'>{label}</span>
      <button
        type='button'
        onClick={onClick}
        className='h-12 px-4 rounded-2xl border border-[#EDEAE7] bg-white text-left text-[14px] flex items-center gap-2 active:bg-[#FBF9F8] transition-colors'
      >
        {icon}
        <span className={value ? 'text-[#21201F]' : 'text-[#A4A4A4]'}>
          {value || placeholder}
        </span>
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className='flex flex-col gap-1.5'>
      <span className='text-[13px] text-[#21201F]'>{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className='min-h-[88px] px-4 py-3 rounded-2xl border border-[#EDEAE7] bg-white text-[#21201F] text-[14px] outline-none focus:border-[#F3811F]/60 placeholder:text-[#A4A4A4] resize-none'
        />
      ) : (
        <input
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className='h-12 px-4 rounded-2xl border border-[#EDEAE7] bg-white text-[#21201F] text-[14px] outline-none focus:border-[#F3811F]/60 placeholder:text-[#A4A4A4]'
        />
      )}
    </label>
  );
}
