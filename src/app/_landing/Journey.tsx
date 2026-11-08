import { JOURNEY } from './content';

// Путь одного заказа — кухонные тикеты на «раздаче». На десктопе секция
// закрепляется и лента едет горизонтально (сдвиг = --p × --rail, см. ScrollFx),
// на мобильных тикеты идут обычной колонкой.
export default function Journey() {
  return (
    <section className='lp-journey' id='journey' data-fx='pin' aria-labelledby='journey-title'>
      <div className='lp-journey__sticky'>
        <div className='lp-wrap lp-journey__head'>
          <h2 className='lp-h2' id='journey-title'>
            Путь одного заказа
          </h2>
          <p className='lp-lead'>
            Что происходит между QR-кодом на столе и повторным визитом гостя.
            Ваш персонал подключается только там, где готовят еду.
          </p>
        </div>

        <div className='lp-rail'>
          <div className='lp-rail__bar' aria-hidden='true'>
            <span className='lp-rail__progress' />
          </div>
          <ol className='lp-rail__track' data-fx-track>
            {JOURNEY.map((step, i) => (
              <li
                key={step.title}
                className='lp-ticket'
                style={{ '--r': i % 2 ? 1 : -1 } as React.CSSProperties}
              >
                <span className='lp-ticket__clip' aria-hidden='true' />
                <div className='lp-ticket__head'>
                  <time className='lp-ticket__time'>{step.time}</time>
                  <span className='lp-ticket__table'>стол 7</span>
                </div>
                <h3 className='lp-ticket__title'>{step.title}</h3>
                <p className='lp-ticket__text'>{step.text}</p>
                <span className='lp-ticket__tear' aria-hidden='true' />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
