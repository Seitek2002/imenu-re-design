'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Trash2, X } from 'lucide-react';
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
      setError('Укажите название (Дом, Работа…)');
      return;
    }
    if (!street.trim() || !coords) {
      setError('Выберите точку на карте и проверьте адрес');
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
      setError('Не удалось сохранить');
    }
  };

  const handleDelete = async () => {
    if (!address) return;
    if (!window.confirm(`Удалить адрес «${address.label}»?`)) return;
    try {
      await del.mutateAsync(address.id);
      onClose();
    } catch {
      setError('Не удалось удалить');
    }
  };

  return (
    <div className='fixed inset-0 z-60 flex items-end sm:items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={() => !busy && onClose()}
      />
      <div className='relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 max-h-[92vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-[18px] font-bold text-[#21201F]'>
            {isEdit ? 'Адрес' : 'Новый адрес'}
          </h3>
          <button
            onClick={onClose}
            disabled={busy}
            className='w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F1EE] text-[#9E9E9E]'
            aria-label='Закрыть'
          >
            <X size={16} />
          </button>
        </div>

        <div className='flex flex-col gap-3'>
          <Field
            label='Название'
            value={label}
            onChange={setLabel}
            placeholder='Дом'
          />

          <button
            type='button'
            onClick={() => setMapOpen(true)}
            className='bg-[#F4F1EE] flex items-center gap-3 rounded-2xl py-3 px-4 text-left active:bg-[#EDEAE7] transition-colors'
          >
            <div className='w-9 h-9 shrink-0 rounded-full bg-white flex items-center justify-center'>
              <MapPin size={18} className={coords ? 'text-brand' : 'text-[#A4A4A4]'} />
            </div>
            <div className='flex flex-col min-w-0 flex-1'>
              <span className='text-[12px] text-[#9E9E9E]'>Точка на карте</span>
              <span className='text-[14px] font-medium text-[#21201F] truncate'>
                {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Выбрать на карте'}
              </span>
            </div>
          </button>

          <Field
            label='Адрес'
            value={street}
            onChange={setStreet}
            placeholder='ул. Киевская, 95'
          />

          <div className='grid grid-cols-3 gap-2'>
            <Field
              label='Подъезд'
              value={entrance ?? ''}
              onChange={setEntrance}
              compact
            />
            <Field label='Этаж' value={floor ?? ''} onChange={setFloor} compact />
            <Field label='Кв.' value={apartment ?? ''} onChange={setApartment} compact />
          </div>

          <Field
            label='Домофон'
            value={intercom ?? ''}
            onChange={setIntercom}
            placeholder='K1234'
          />

          <Field
            label='Комментарий'
            value={comment ?? ''}
            onChange={setComment}
            placeholder='Зелёная дверь, не звонить'
          />

          <label className='flex items-center justify-between gap-3 bg-[#F4F1EE] rounded-2xl py-3 px-4'>
            <span className='text-[14px] text-[#21201F]'>Использовать по умолчанию</span>
            <input
              type='checkbox'
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className='w-5 h-5 accent-[#21201F]'
            />
          </label>
        </div>

        {error && (
          <div className='mt-3 text-[12px] text-[#DC2626]'>{error}</div>
        )}

        <div className='mt-5 flex items-center gap-2'>
          {isEdit && (
            <button
              type='button'
              onClick={handleDelete}
              disabled={busy}
              className='h-12 px-4 rounded-2xl bg-[#FDECEC] text-[#DC2626] inline-flex items-center justify-center disabled:opacity-60'
              aria-label='Удалить'
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            type='button'
            onClick={handleSave}
            disabled={busy}
            className='flex-1 h-12 rounded-2xl bg-[#21201F] text-white text-[14px] font-medium active:scale-[0.99] transition-transform disabled:opacity-60'
          >
            Сохранить
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

function Field({
  label,
  value,
  onChange,
  placeholder,
  compact,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  return (
    <label className='flex flex-col gap-1'>
      <span className={compact ? 'text-[11px] text-[#9E9E9E]' : 'text-[12px] text-[#9E9E9E]'}>
        {label}
      </span>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${compact ? 'h-10 px-3 text-[13px]' : 'h-12 px-4 text-[14px]'} rounded-2xl bg-[#F4F1EE] text-[#21201F] outline-none focus:ring-2 focus:ring-[#21201F]/10`}
      />
    </label>
  );
}
