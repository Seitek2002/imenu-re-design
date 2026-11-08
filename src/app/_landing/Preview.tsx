import type { PreviewId } from './content';
import { DEMO_QR_PATH, DEMO_QR_SIZE } from './qr';

// Мини-сцены для «тарелки» в меню возможностей. Чисто декоративные
// (aria-hidden на контейнере): весь смысл продублирован текстом в списке.

function DemoQr({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`-2 -2 ${DEMO_QR_SIZE + 4} ${DEMO_QR_SIZE + 4}`}
      className={className}
      shapeRendering='crispEdges'
    >
      <rect x='-2' y='-2' width={DEMO_QR_SIZE + 4} height={DEMO_QR_SIZE + 4} fill='#fff' />
      <path d={DEMO_QR_PATH} fill='#2b0715' />
    </svg>
  );
}

function Bubble({ from, children }: { from: 'guest' | 'bot'; children: React.ReactNode }) {
  return <span className={`lp-pv-bubble lp-pv-bubble--${from}`}>{children}</span>;
}

export default function Preview({ id }: { id: PreviewId }) {
  switch (id) {
    case 'qr-table':
      return (
        <div className='lp-pv lp-pv-tent'>
          <span className='lp-pv-tent__table'>Стол 7</span>
          <DemoQr className='lp-pv-tent__qr' />
          <span className='lp-pv-tent__hint'>
            Это настоящее демо-меню. Наведите камеру телефона.
          </span>
        </div>
      );

    case 'table-bill':
      return (
        <div className='lp-pv lp-pv-card'>
          <span className='lp-pv-card__title'>Счёт стола 7</span>
          <span className='lp-pv-row'>
            <span>Лагман</span>
            <b>420</b>
          </span>
          <span className='lp-pv-row'>
            <span>Плов</span>
            <b>380</b>
          </span>
          <span className='lp-pv-row'>
            <span>Чай чёрный, 2</span>
            <b>120</b>
          </span>
          <span className='lp-pv-row lp-pv-row--total'>
            <span>Итого</span>
            <b>920 сом</b>
          </span>
          <span className='lp-pv-btn'>Оплатить счёт</span>
        </div>
      );

    case 'kiosk':
      return (
        <div className='lp-pv lp-pv-kiosk'>
          <span className='lp-pv-kiosk__screen'>
            <span className='lp-pv-kiosk__q'>Добавить картофель фри?</span>
            <span className='lp-pv-kiosk__price'>+150 сом</span>
            <span className='lp-pv-kiosk__actions'>
              <span className='lp-pv-btn'>Добавить</span>
              <span className='lp-pv-btn lp-pv-btn--ghost'>Нет, спасибо</span>
            </span>
          </span>
          <span className='lp-pv-kiosk__stand' />
        </div>
      );

    case 'languages':
      return (
        <div className='lp-pv lp-pv-card'>
          <span className='lp-pv-langs'>
            <span>Русский</span>
            <span className='is-on'>Кыргызча</span>
            <span>English</span>
          </span>
          <span className='lp-pv-row'>
            <span>Жалбыз чайы</span>
            <b>90</b>
          </span>
          <span className='lp-pv-row'>
            <span>Лагман</span>
            <b>420</b>
          </span>
          <span className='lp-pv-row'>
            <span>Самса</span>
            <b>110</b>
          </span>
        </div>
      );

    case 'qr-takeaway':
      return (
        <div className='lp-pv lp-pv-card'>
          <span className='lp-pv-card__title'>Заказ №248 готов</span>
          <span className='lp-pv-card__text'>Заберите на стойке выдачи</span>
          <span className='lp-pv-steps'>
            <span className='is-done'>Принят</span>
            <span className='is-done'>Готовится</span>
            <span className='is-now'>Готов</span>
          </span>
        </div>
      );

    case 'link-menu':
      return (
        <div className='lp-pv lp-pv-card lp-pv-insta'>
          <span className='lp-pv-insta__head'>
            <span className='lp-pv-insta__avatar' />
            <span>
              <b>your.cafe</b>
              <small>Кафе, Бишкек</small>
            </span>
          </span>
          <span className='lp-pv-card__text'>Доставка и самовывоз по ссылке</span>
          <span className='lp-pv-insta__link'>imenu.kg/your-cafe</span>
        </div>
      );

    case 'payment':
      return (
        <div className='lp-pv lp-pv-card lp-pv-pay'>
          <span className='lp-pv-card__text'>К оплате</span>
          <span className='lp-pv-pay__sum'>1 240 сом</span>
          <span className='lp-pv-pay__method'>
            <span className='lp-pv-pay__qr' />
            <span>ELQR, любой банк Кыргызстана</span>
          </span>
          <span className='lp-pv-btn'>Оплатить</span>
        </div>
      );

    case 'pos':
      return (
        <div className='lp-pv lp-pv-ticket'>
          <span className='lp-pv-ticket__head'>
            <b>Кухня</b>
            <span>19:05</span>
          </span>
          <span>Заказ 248, стол 7</span>
          <span className='lp-pv-ticket__rule' />
          <span>1 × Лагман</span>
          <span>2 × Чай чёрный</span>
          <span className='lp-pv-ticket__rule' />
          <span className='lp-pv-ticket__chip'>Передано в Poster</span>
        </div>
      );

    case 'telegram':
      return (
        <div className='lp-pv lp-pv-chat'>
          <span className='lp-pv-chat__name'>iMenu Бот</span>
          <Bubble from='bot'>Новый заказ №248, стол 7</Bubble>
          <Bubble from='bot'>1 × Лагман, 2 × Чай чёрный. 1 240 сом, оплачен по QR</Bubble>
          <Bubble from='bot'>Новый заказ №249, навынос к 19:30</Bubble>
        </div>
      );

    case 'ai':
      return (
        <div className='lp-pv lp-pv-chat'>
          <span className='lp-pv-chat__name'>WhatsApp, 02:14</span>
          <Bubble from='guest'>Можно два лагмана с собой к часу дня?</Bubble>
          <Bubble from='bot'>
            Конечно. Два лагмана, 840 сом. Ссылка на оплату ниже, заказ будет готов к 13:00.
          </Bubble>
        </div>
      );

    case 'guests':
      return (
        <div className='lp-pv lp-pv-card'>
          <span className='lp-pv-card__title'>Гости</span>
          <span className='lp-pv-row'>
            <span>Айгерим, ··· 12</span>
            <b>14 заказов</b>
          </span>
          <span className='lp-pv-row'>
            <span>Бакыт, ··· 47</span>
            <b>6 заказов</b>
          </span>
          <span className='lp-pv-row'>
            <span>Елена, ··· 03</span>
            <b>3 заказа</b>
          </span>
        </div>
      );

    case 'loyalty':
      return (
        <div className='lp-pv lp-pv-bonus'>
          <span className='lp-pv-card__text'>Ваши бонусы</span>
          <span className='lp-pv-bonus__value'>1 860</span>
          <span className='lp-pv-bonus__level'>Постоянный гость, 7% бонусами</span>
        </div>
      );

    case 'dashboard':
      return (
        <div className='lp-pv lp-pv-card'>
          <span className='lp-pv-card__title'>Выручка за неделю</span>
          <span className='lp-pv-chart'>
            {[46, 58, 52, 70, 64, 92, 84].map((h, i) => (
              <span key={i} style={{ '--h': h } as React.CSSProperties} />
            ))}
          </span>
          <span className='lp-pv-row'>
            <span>Заказов сегодня</span>
            <b>64</b>
          </span>
        </div>
      );

    default:
      return null;
  }
}
