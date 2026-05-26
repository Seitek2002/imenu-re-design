'use client';

/**
 * /[venue]/support/my — «Мои заявки» (история жалоб).
 *
 * Сейчас рендерится на мок-данных: контракт `GET /v2/support/tickets/`
 * существует (Kuma 2026-05-25 §2), но шейп ответа и enum статусов
 * не подтверждён. Открытые вопросы вынесены в [[project_kuma_questions]] —
 * до их закрытия фронт показывает реалистичный список из useMockTickets().
 *
 * Маппинг полей при подключении бэка будет тривиальным: id/kind/reference/
 * problem/photos/createdAt уже совпадают с тем, что мы отправляли в
 * POST /support/tickets/.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ChevronLeft,
  ChevronDown,
  Store,
  ShoppingBag,
  MessageSquareText,
  Clock,
  CheckCircle2,
  Image as ImageIcon,
  Inbox,
  Plus,
} from 'lucide-react';

import { useClientStore } from '@/store/client';

type Kind = 'venue' | 'order' | 'other';
type Status = 'pending' | 'in_review' | 'resolved' | 'closed';

interface Ticket {
  id: number;
  kind: Kind;
  /** Резолвед label (название филиала / №заказа / тема). На бэк ждём
   *  денормализацию — иначе фронту придётся отдельным запросом. */
  referenceLabel: string;
  problem: string;
  photos: string[];
  status: Status;
  createdAt: string;
  /** Двусторонний чат заявок отложен P2 (Kuma 2026-05-25). Сейчас всегда null. */
  lastReply: null;
}

const KIND_ICON: Record<Kind, React.ElementType> = {
  venue: Store,
  order: ShoppingBag,
  other: MessageSquareText,
};

const KIND_TONE: Record<Kind, { icon: string; bg: string }> = {
  venue: { icon: 'text-[#F3811F]', bg: 'bg-[#FFEBD0]' },
  order: { icon: 'text-[#22A05A]', bg: 'bg-[#EAF7EC]' },
  other: { icon: 'text-[#3F6BDB]', bg: 'bg-[#E8EEFA]' },
};

const STATUS_TONE: Record<Status, { bg: string; fg: string }> = {
  pending: { bg: 'bg-[#FFF4E5]', fg: 'text-[#B8731A]' },
  in_review: { bg: 'bg-[#E7F1FF]', fg: 'text-[#2E7DFF]' },
  resolved: { bg: 'bg-[#E8F8EE]', fg: 'text-[#22A05A]' },
  closed: { bg: 'bg-[#EFEFEF]', fg: 'text-[#6B6B6B]' },
};

const useMockTickets = (): Ticket[] =>
  useMemo(
    () => [
      {
        id: 1041,
        kind: 'order',
        referenceLabel: '№ 28491',
        problem:
          'Привезли остывший суп, доставка прибыла позже расчётного времени на ~25 мин. Очень разочарованы.',
        photos: [],
        status: 'in_review',
        createdAt: '2026-05-25T19:42:00+06:00',
        lastReply: null,
      },
      {
        id: 1037,
        kind: 'venue',
        referenceLabel: 'iMenu · Чуй 165',
        problem:
          'Кондиционер в зале не работал, было душно. На столе остались крошки от предыдущих гостей.',
        photos: ['https://placehold.co/200x200/png'],
        status: 'pending',
        createdAt: '2026-05-24T13:18:00+06:00',
        lastReply: null,
      },
      {
        id: 1018,
        kind: 'other',
        referenceLabel: 'Не пришли баллы',
        problem:
          'Оплатил заказ № 28102 на 4520 сом, по приложению должно было начислиться 226 баллов. Прошло 3 дня — баланс прежний.',
        photos: [],
        status: 'resolved',
        createdAt: '2026-05-19T10:05:00+06:00',
        lastReply: null,
      },
      {
        id: 1002,
        kind: 'order',
        referenceLabel: '№ 27634',
        problem:
          'Заказ пришёл не полностью — отсутствует один из бургеров. Курьер сказал «как принесли так и везу».',
        photos: [],
        status: 'closed',
        createdAt: '2026-05-10T20:11:00+06:00',
        lastReply: null,
      },
    ],
    [],
  );

const monthShort = [
  'янв', 'фев', 'мар', 'апр', 'май', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
];

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  const date = `${d.getDate()} ${monthShort[d.getMonth()]}`;
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return { date, time };
};

const STATUS_LABEL: Record<Status, string> = {
  pending: 'Ожидает',
  in_review: 'Рассматривают',
  resolved: 'Решено',
  closed: 'Закрыто',
};

const KIND_LABEL: Record<Kind, string> = {
  venue: 'Филиал',
  order: 'Заказ',
  other: 'Другое',
};

export default function SupportMyPage() {
  const { venue: venueSlug } = useParams<{ venue: string }>();
  const tProfile = useTranslations('Profile');
  const phone = useClientStore((s) => s.phone);
  const tickets = useMockTickets();

  if (!phone) {
    return <EmptyState venueSlug={venueSlug} unauth />;
  }
  if (tickets.length === 0) {
    return <EmptyState venueSlug={venueSlug} />;
  }

  return (
    <div className='min-h-svh pb-24'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venueSlug}/profile`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label={tProfile('back')}
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>
          Мои заявки
        </h1>
      </header>

      <div className='px-4 mt-2 flex flex-col gap-3'>
        {tickets.map((tk) => (
          <TicketRow key={tk.id} ticket={tk} />
        ))}
      </div>

      <div className='fixed bottom-20 left-0 right-0 px-4 max-w-175 mx-auto'>
        <Link
          href={`/${venueSlug}/support`}
          className='w-full h-12 rounded-2xl bg-[linear-gradient(to_right,#FAA924_31%,#F3811F_71%)] text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 shadow-[0_8px_20px_-8px_rgba(243,129,31,0.55)] active:scale-[0.99] transition-transform'
        >
          <Plus size={16} />
          Новая заявка
        </Link>
      </div>
    </div>
  );
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = KIND_ICON[ticket.kind];
  const kindTone = KIND_TONE[ticket.kind];
  const statusTone = STATUS_TONE[ticket.status];
  const { date, time } = fmtDate(ticket.createdAt);
  const showStatusIcon =
    ticket.status === 'resolved' ? CheckCircle2 : Clock;
  const StatusIcon = showStatusIcon;

  return (
    <button
      type='button'
      onClick={() => setExpanded((v) => !v)}
      className='block w-full bg-white rounded-2xl px-4 py-4 active:scale-[0.99] transition-transform text-left'
    >
      <div className='flex items-start gap-3'>
        <span
          className={`w-9 h-9 rounded-xl inline-flex items-center justify-center shrink-0 ${kindTone.bg}`}
        >
          <Icon size={18} className={kindTone.icon} />
        </span>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2 min-w-0'>
              <span className='text-[13px] font-semibold text-[#21201F] truncate'>
                {ticket.referenceLabel}
              </span>
            </div>
            {date && (
              <div className='text-[12px] text-[#9E9E9E] flex items-center gap-1.5 shrink-0'>
                <span>{date}</span>
                <span className='inline-block w-[3px] h-[3px] rounded-full bg-[#C4C4C4]' />
                <span>{time}</span>
              </div>
            )}
          </div>

          <div className='mt-2 flex items-center gap-2 flex-wrap'>
            <span className='h-[24px] px-2.5 rounded-full text-[11px] font-medium inline-flex items-center bg-[#F4F1EE] text-[#6B6B6B]'>
              {KIND_LABEL[ticket.kind]}
            </span>
            <span
              className={`h-[24px] px-2.5 rounded-full text-[11px] font-medium inline-flex items-center gap-1 ${statusTone.bg} ${statusTone.fg}`}
            >
              <StatusIcon size={12} strokeWidth={2.4} />
              {STATUS_LABEL[ticket.status]}
            </span>
            {ticket.photos.length > 0 && (
              <span className='text-[12px] text-[#9E9E9E] inline-flex items-center gap-1'>
                <ImageIcon size={13} strokeWidth={2} />
                {ticket.photos.length}
              </span>
            )}
            <span className='ml-auto text-[12px] text-[#9E9E9E] inline-flex items-center gap-1'>
              {expanded ? 'Свернуть' : 'Подробнее'}
              <ChevronDown
                size={14}
                className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </span>
          </div>

          <p
            className={`mt-3 text-[13px] text-[#4B4742] leading-snug ${
              expanded ? '' : 'line-clamp-2'
            }`}
          >
            {ticket.problem}
          </p>

          {expanded && ticket.photos.length > 0 && (
            <div className='mt-3 flex flex-wrap gap-2'>
              {ticket.photos.map((src, i) => (
                <div
                  key={i}
                  className='relative w-[72px] h-[72px] rounded-xl overflow-hidden border border-[#EDEAE7] bg-[#F4F1EE]'
                >
                  <Image
                    src={src}
                    alt=''
                    fill
                    className='object-cover'
                    sizes='72px'
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}

          {expanded && ticket.status !== 'resolved' && (
            <div className='mt-3 text-[12px] text-[#9E9E9E] border-t border-[#F1EEEB] pt-3'>
              Ответ менеджера придёт сюда, когда заявку обработают.
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function EmptyState({
  venueSlug,
  unauth,
}: {
  venueSlug: string;
  unauth?: boolean;
}) {
  const tProfile = useTranslations('Profile');
  return (
    <div className='min-h-svh pb-24 flex flex-col'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venueSlug}/profile`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label={tProfile('back')}
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>
          Мои заявки
        </h1>
      </header>

      <div className='flex-1 flex flex-col items-center justify-center px-6 text-center'>
        <div className='w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-5'>
          <Inbox size={36} className='text-[#C4B59C]' strokeWidth={1.5} />
        </div>
        <h2 className='text-[18px] font-bold text-[#21201F]'>
          {unauth ? 'Войдите по номеру' : 'Заявок пока нет'}
        </h2>
        <p className='mt-2 text-[13px] text-[#9E9E9E] max-w-xs'>
          {unauth
            ? 'Чтобы посмотреть свои обращения, авторизуйтесь в профиле.'
            : 'Если что-то не так — расскажите нам, мы разберёмся.'}
        </p>
        <Link
          href={unauth ? `/${venueSlug}/profile` : `/${venueSlug}/support`}
          className='mt-6 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-[#21201F] text-white text-[14px] font-medium active:scale-[0.99] transition-transform'
        >
          {unauth ? 'Перейти в профиль' : 'Оставить заявку'}
        </Link>
      </div>
    </div>
  );
}
