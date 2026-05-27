'use client';

/**
 * /[venue]/support — экран «Помощь». Три таба (Филиал/Заказ/Другое), под
 * каждый свой селектор, общая textarea + загрузка фото + кнопка «Отправить».
 *
 * Подключено к POST /v2/support/tickets/ (Kuma 2026-05-25 §2). Endpoint
 * работает и без auth: бэк перезаписывает `phone` из JWT, но если токена
 * нет — берёт переданное в body значение.
 */

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ChevronLeft,
  ChevronDown,
  Check,
  Plus,
  Store,
  ShoppingBag,
  MessageSquareText,
  X,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { useVenueStore } from '@/store/venue';
import { useClientStore } from '@/store/client';
import { useOrdersInfiniteV2 } from '@/lib/api/queries';
import type { OrderV2 } from '@/lib/order';
import { API_V2_URL } from '@/lib/config';
import { normalizePhoneForApi } from '@/lib/helpers/phone';
import { getAccessTokenSnapshot } from '@/store/auth';

type TabKey = 'venue' | 'order' | 'other';

const MAX_PHOTOS = 5;
const MAX_FILE_MB = 5;

interface PhotoItem {
  url: string;
  name: string;
  file: File;
}

const TAB_ICONS: Record<TabKey, React.ElementType> = {
  venue: Store,
  order: ShoppingBag,
  other: MessageSquareText,
};

/**
 * Семантические цвета табов. Каждый таб закреплён за акцентом и сохраняет его
 * через все состояния: иконки окрашены всегда (даже когда таб неактивен —
 * работает как цветовая легенда), активный таб получает тинт-фон, селект
 * под выбранным табом — рамку и подсветку того же оттенка.
 */
const TAB_TONE: Record<
  TabKey,
  {
    icon: string;
    label: string;
    bg: string;
    borderActive: string;
    /** Цветная тень-«свечение» вокруг активного селекта/textarea — внутри белый фон. */
    shadow: string;
  }
> = {
  venue: {
    icon: 'text-[#F3811F]',
    label: 'text-[#F3811F]',
    bg: 'bg-[#FFEBD0]',
    borderActive: 'border-[#F3811F]',
    shadow: '0 10px 28px -10px rgba(243, 129, 31, 0.35)',
  },
  order: {
    icon: 'text-[#22A05A]',
    label: 'text-[#22A05A]',
    bg: 'bg-[#EAF7EC]',
    borderActive: 'border-[#22A05A]',
    shadow: '0 10px 28px -10px rgba(34, 160, 90, 0.35)',
  },
  other: {
    icon: 'text-[#3F6BDB]',
    label: 'text-[#3F6BDB]',
    bg: 'bg-[#E8EEFA]',
    borderActive: 'border-[#3F6BDB]',
    shadow: '0 10px 28px -10px rgba(63, 107, 219, 0.35)',
  },
};

export default function SupportPage() {
  const t = useTranslations('Support');
  const tProfile = useTranslations('Profile');
  const router = useRouter();
  const search = useSearchParams();
  const { venue: venueSlug } = useParams<{ venue: string }>();
  const venueData = useVenueStore((s) => s.data);
  const phone = useClientStore((s) => s.phone);

  const initialTab = (search.get('tab') as TabKey) || 'venue';
  const [tab, setTab] = useState<TabKey>(
    ['venue', 'order', 'other'].includes(initialTab) ? initialTab : 'venue',
  );

  const [selected, setSelected] = useState<Record<TabKey, string | null>>({
    venue: null,
    order: null,
    other: null,
  });
  const [openSelector, setOpenSelector] = useState(false);
  const [problem, setProblem] = useState('');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successAt, setSuccessAt] = useState<Date | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // Список заказов для таба «Заказ». Используем тот же хук что в /history —
  // последние 20 заказов клиента (по телефону).
  const { data: ordersData } = useOrdersInfiniteV2({
    phone,
    venueSlug,
    limit: 20,
    includeUnpaid: true,
  });
  const orders = useMemo(
    () => ordersData?.pages.flatMap((p) => p.results) ?? [],
    [ordersData],
  );

  const topics: string[] = useMemo(() => {
    const raw = t.raw('topics');
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [t]);

  const options: Option[] = useMemo(() => {
    if (tab === 'venue') {
      return (venueData?.spots ?? []).map((s) => ({
        value: String(s.id),
        label: s.name,
        sub: s.address,
      }));
    }
    if (tab === 'order') {
      return orders.map((o: OrderV2) => ({
        value: String(o.id),
        label: `№ ${o.id}`,
        meta: formatShortDate(o.createdAt),
        right: `${Math.round(Number(o.totalPrice))} сом`,
      }));
    }
    return topics.map((s) => ({ value: s, label: s }));
  }, [tab, venueData?.spots, orders, topics]);

  const selectorLabel =
    tab === 'venue'
      ? t('venueLabel')
      : tab === 'order'
        ? t('orderLabel')
        : t('topicLabel');

  const selectorPlaceholder =
    tab === 'venue'
      ? t('venuePlaceholder')
      : tab === 'order'
        ? t('orderPlaceholder')
        : t('topicPlaceholder');

  const selectorEmptyText =
    tab === 'venue'
      ? t('venueEmpty')
      : tab === 'order'
        ? t('orderEmpty')
        : null;

  const currentValue = selected[tab];
  const currentLabel = options.find((o) => o.value === currentValue)?.label;

  const switchTab = (next: TabKey) => {
    setTab(next);
    setOpenSelector(false);
    setError(null);
  };

  const onPickFiles = (files: FileList | null) => {
    if (!files) return;
    setError(null);
    const next = [...photos];
    for (const f of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) {
        setError(t('errors.tooManyPhotos', { max: MAX_PHOTOS }));
        break;
      }
      if (!f.type.startsWith('image/')) {
        setError(t('errors.notImage'));
        continue;
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        setError(t('errors.fileTooBig', { mb: MAX_FILE_MB }));
        continue;
      }
      next.push({ url: URL.createObjectURL(f), name: f.name, file: f });
    }
    setPhotos(next);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos((arr) => {
      const next = [...arr];
      const [removed] = next.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

  const submit = async () => {
    setError(null);
    if (!currentValue) {
      setError(t('errors.selectRequired'));
      return;
    }
    if (!problem.trim()) {
      setError(t('errors.problemRequired'));
      return;
    }
    if (problem.length > 2000) {
      setError(t('errors.problemTooLong'));
      return;
    }
    if (!phone) {
      setError(t('errors.phoneRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('kind', tab);
      fd.append('reference', currentValue);
      fd.append('problem', problem.trim());
      fd.append('phone', normalizePhoneForApi(phone));
      fd.append('venueSlug', venueSlug);
      photos.forEach((p) => fd.append('photos', p.file));

      const token = getAccessTokenSnapshot();
      // Не выставляем Content-Type вручную — браузер сам подставит
      // multipart/form-data с правильным boundary (Kuma §5.4).
      const res = await fetch(`${API_V2_URL}/support/tickets/`, {
        method: 'POST',
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.status === 201) {
        setSuccessAt(new Date());
        return;
      }

      const body = await res.json().catch(() => ({}));
      setError(humanizeSupportError(body, res.status, t));
    } catch {
      setError(t('errors.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-svh pb-28'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venueSlug}/profile`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label={tProfile('back')}
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>
          {t('title')}
        </h1>
      </header>

      <div className='px-4 mt-2 flex flex-col gap-4'>
        <div className='bg-white rounded-2xl p-1.5 grid grid-cols-3 gap-1.5'>
          {(['venue', 'order', 'other'] as TabKey[]).map((k) => {
            const Icon = TAB_ICONS[k];
            const active = tab === k;
            const tone = TAB_TONE[k];
            return (
              <button
                key={k}
                type='button'
                onClick={() => switchTab(k)}
                className={`h-10 rounded-xl inline-flex items-center justify-center gap-2 text-[13px] font-medium transition-colors ${
                  active
                    ? `${tone.bg} ${tone.label}`
                    : 'bg-transparent text-[#9E9E9E]'
                }`}
              >
                <Icon size={16} className={tone.icon} />
                {t(`tabs.${k}`)}
              </button>
            );
          })}
        </div>

        <FieldShell label={selectorLabel}>
          <Selector
            placeholder={selectorPlaceholder}
            emptyText={selectorEmptyText}
            open={openSelector}
            onToggle={() => setOpenSelector((v) => !v)}
            onPick={(v) => {
              setSelected((s) => ({ ...s, [tab]: v }));
              setOpenSelector(false);
            }}
            value={currentValue}
            currentLabel={currentLabel}
            options={options}
            tone={TAB_TONE[tab]}
          />
        </FieldShell>

        <FieldShell label={t('problemLabel')}>
          <ProblemTextarea
            value={problem}
            onChange={setProblem}
            placeholder={t('problemPlaceholder')}
            tone={TAB_TONE[tab]}
          />
        </FieldShell>

        <FieldShell label={t('photosLabel')}>
          <div className='flex flex-wrap gap-2'>
            {photos.map((p, idx) => (
              <div
                key={p.url}
                className='relative w-[72px] h-[72px] rounded-xl overflow-hidden border border-[#EDEAE7]'
              >
                <Image
                  src={p.url}
                  alt={p.name}
                  fill
                  className='object-cover'
                  unoptimized
                />
                <button
                  type='button'
                  onClick={() => removePhoto(idx)}
                  aria-label='remove'
                  className='absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white inline-flex items-center justify-center'
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type='button'
                onClick={() => photoInputRef.current?.click()}
                className='w-[72px] h-[72px] rounded-xl border border-dashed border-[#D7D2CC] inline-flex flex-col items-center justify-center gap-1 text-[#9E9E9E]'
              >
                <Plus size={16} />
                <span className='text-[11px]'>{t('photoAdd')}</span>
              </button>
            )}
            <input
              ref={photoInputRef}
              type='file'
              accept='image/*'
              multiple
              hidden
              onChange={(e) => onPickFiles(e.target.files)}
            />
          </div>
        </FieldShell>

        {error && (
          <div className='text-[12px] text-[#DC2626] px-1'>{error}</div>
        )}
      </div>

      <div className='fixed bottom-20 left-0 right-0 px-4 max-w-175 mx-auto'>
        <button
          type='button'
          onClick={submit}
          disabled={submitting}
          className='w-full h-12 rounded-2xl bg-[linear-gradient(to_right,#FAA924_31%,#F3811F_71%)] text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 shadow-[0_8px_20px_-8px_rgba(243,129,31,0.55)] active:scale-[0.99] transition-transform disabled:opacity-70'
        >
          {submitting && <Loader2 size={16} className='animate-spin' />}
          {submitting ? t('submitting') : t('submit')}
        </button>
      </div>

      {successAt && (
        <SuccessSheet
          sentAt={successAt}
          onViewAll={() => {
            // /support/my пока на моках — реальный список ждёт подключения
            // GET /v2/support/tickets/ (Kuma 2026-05-25 §2, P1).
            router.push(`/${venueSlug}/support/my`);
          }}
          onClose={() => {
            setSelected({ venue: null, order: null, other: null });
            setProblem('');
            setPhotos([]);
            setSuccessAt(null);
          }}
        />
      )}
    </div>
  );
}

function FieldShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className='flex flex-col gap-1.5'>
      <span className='text-[13px] text-[#21201F]'>{label}</span>
      {children}
    </label>
  );
}

function ProblemTextarea({
  value,
  onChange,
  placeholder,
  tone,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  tone: Tone;
}) {
  const [focused, setFocused] = useState(false);
  // Принадлежность табу — те же правила что у Selector: либо фокус, либо
  // уже введён текст (поле «использовано»).
  const accented = focused || value.length > 0;
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      rows={4}
      className={`w-full min-h-[112px] px-4 py-3 rounded-2xl border bg-white text-[14px] text-[#21201F] outline-none placeholder:text-[#A4A4A4] resize-none transition-colors ${
        accented ? tone.borderActive : 'border-[#EDEAE7]'
      }`}
    />
  );
}

interface Tone {
  icon: string;
  label: string;
  bg: string;
  borderActive: string;
  shadow: string;
}

interface Option {
  value: string;
  /** Основной текст слева (номер заказа, имя филиала, тема). */
  label: string;
  /** Вторичный серый текст рядом с label (используется для даты заказа). */
  meta?: string;
  /** Подпись под строкой (используется для адреса филиала). */
  sub?: string;
  /** Контент справа, выровненный по правому краю (сумма заказа). */
  right?: React.ReactNode;
}

interface SelectorProps {
  placeholder: string;
  emptyText: string | null;
  open: boolean;
  onToggle: () => void;
  onPick: (v: string) => void;
  value: string | null;
  currentLabel: string | undefined;
  options: Option[];
  tone: Tone;
}

function Selector({
  placeholder,
  emptyText,
  open,
  onToggle,
  onPick,
  value,
  currentLabel,
  options,
  tone,
}: SelectorProps) {
  const showEmpty = options.length === 0 && emptyText;
  // Рамка активного состояния: либо открыт, либо выбран ненулевой value —
  // в любом из этих случаев селект «принадлежит» табу и красится в его тон.
  const accented = open || !!value;
  const accentColor = tone.label.match(/#[0-9A-F]{6}/i)?.[0] ?? '#F3811F';
  return (
    <div className='flex flex-col gap-1.5'>
      <button
        type='button'
        onClick={onToggle}
        disabled={options.length === 0}
        className={`h-12 px-4 rounded-2xl border bg-white text-left text-[14px] flex items-center justify-between transition-colors disabled:opacity-60 ${
          accented ? tone.borderActive : 'border-[#EDEAE7]'
        }`}
      >
        <span className={currentLabel ? 'text-[#21201F]' : 'text-[#A4A4A4]'}>
          {currentLabel || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
          color={accented ? accentColor : '#9E9E9E'}
        />
      </button>

      {showEmpty && (
        <div className='text-[12px] text-[#9E9E9E] px-1'>{emptyText}</div>
      )}

      {open && options.length > 0 && (
        <div
          className={`rounded-2xl border overflow-hidden bg-white ${tone.borderActive}`}
          style={{ boxShadow: tone.shadow }}
        >
          <ul className='max-h-[260px] overflow-y-auto divide-y divide-black/5'>
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type='button'
                    onClick={() => onPick(opt.value)}
                    className='w-full px-4 py-3 flex items-center gap-3 text-left transition-colors bg-white hover:bg-[#FBF9F8]'
                  >
                    <span className='min-w-0 flex-1'>
                      <span className='flex items-baseline gap-2'>
                        <span
                          className={`text-[14px] text-[#21201F] truncate ${
                            active ? 'font-semibold' : ''
                          }`}
                        >
                          {opt.label}
                        </span>
                        {opt.meta && (
                          <span className='text-[14px] text-[#9E9E9E] shrink-0'>
                            {opt.meta}
                          </span>
                        )}
                      </span>
                      {opt.sub && (
                        <span className='block text-[12px] text-[#9E9E9E] truncate mt-0.5'>
                          {opt.sub}
                        </span>
                      )}
                    </span>
                    {opt.right && (
                      <span className='text-[14px] text-[#21201F] text-right shrink-0 tabular-nums'>
                        {opt.right}
                      </span>
                    )}
                    {active && !opt.right && (
                      <Check
                        size={16}
                        className='shrink-0'
                        color={accentColor}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function SuccessSheet({
  sentAt,
  onViewAll,
  onClose,
}: {
  sentAt: Date;
  onViewAll: () => void;
  onClose: () => void;
}) {
  const t = useTranslations('Support.success');
  const dateStr = `${String(sentAt.getDate()).padStart(2, '0')}.${String(sentAt.getMonth() + 1).padStart(2, '0')} ${String(sentAt.getHours()).padStart(2, '0')}:${String(sentAt.getMinutes()).padStart(2, '0')}`;
  return (
    <div className='fixed inset-0 z-60 flex items-end sm:items-center justify-center'>
      <div className='absolute inset-0 bg-black/40 enter-fade' onClick={onClose} />
      <div className='relative bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl px-6 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col items-center text-center enter-sheet-sm'>
        <div className='w-14 h-14 rounded-full bg-[#EAF7EC] inline-flex items-center justify-center mb-3'>
          <Check size={28} className='text-[#22A05A]' strokeWidth={2.5} />
        </div>
        <h3 className='text-[16px] font-bold text-[#21201F]'>{t('title')}</h3>
        <p className='mt-1.5 text-[13px] text-[#9E9E9E]'>
          {t('description', { date: dateStr })}
        </p>
        <button
          type='button'
          onClick={onViewAll}
          className='mt-5 w-full h-12 rounded-2xl bg-[linear-gradient(to_right,#FAA924_31%,#F3811F_71%)] text-white text-[14px] font-medium active:scale-[0.99] transition-transform'
        >
          {t('viewAll')}
        </button>
        <button
          type='button'
          onClick={onClose}
          className='mt-2 text-[13px] text-[#9E9E9E]'
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
}

type Translator = ReturnType<typeof useTranslations>;

/**
 * Преобразует DRF-ответ об ошибке в одну читаемую строку. Формат бэка:
 * `{ "photos": ["Файл больше 5 MB."], "phone": ["..."] }` либо `{ "detail": "..." }`.
 */
function humanizeSupportError(
  body: unknown,
  httpStatus: number,
  t: Translator,
): string {
  if (httpStatus >= 500) return t('errors.serverDown');
  if (!body || typeof body !== 'object') return t('errors.submitFailed');

  const rec = body as Record<string, unknown>;
  if (typeof rec.detail === 'string') return rec.detail;

  for (const [field, msgs] of Object.entries(rec)) {
    if (Array.isArray(msgs) && msgs.length && typeof msgs[0] === 'string') {
      return field === 'photos' || field === 'detail'
        ? (msgs[0] as string)
        : `${field}: ${msgs[0]}`;
    }
  }
  return t('errors.submitFailed');
}

function formatShortDate(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  // ru-RU 'd MMM' → "12 апр" — короткая форма для списка заказов.
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(d);
}
