import { LAUNCH } from './content';

export default function Launch() {
  return (
    <section className='lp-launch' aria-labelledby='launch-title'>
      <div className='lp-wrap'>
        <div className='lp-launch__head'>
          <h2 className='lp-h2' id='launch-title'>
            Запуск за три дня
          </h2>
          <p className='lp-lead'>
            От первого звонка до первого заказа через iMenu. Работу заведения
            останавливать не нужно.
          </p>
        </div>

        <div className='lp-launch__steps' data-fx='view'>
          <span className='lp-launch__line' aria-hidden='true' />
          <ol className='lp-launch__list'>
          {LAUNCH.map((step, i) => (
            <li
              key={step.day}
              className='lp-launch__step'
              style={{ '--i': i } as React.CSSProperties}
            >
              <span className='lp-launch__day'>{step.day}</span>
              <h3 className='lp-launch__title'>{step.title}</h3>
              <p className='lp-launch__text'>{step.text}</p>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
