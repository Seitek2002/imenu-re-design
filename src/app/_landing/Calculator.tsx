'use client';

import { useEffect, useId, useRef, useState } from 'react';

const IMENU_RATE = 0.015;
const RATES = [0.2, 0.25, 0.3] as const;

const nf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const som = (v: number) => `${nf.format(Math.round(v))} сом`;

/**
 * Число, которое «докручивается» до нового значения. React рендерит только
 * стартовый текст, дальше textContent меняется напрямую в rAF — без
 * перерисовки компонента на каждый кадр.
 */
function TweenNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [initial] = useState(value);
  const shown = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = shown.current;
    const to = value;
    if (from === to) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shown.current = to;
      el.textContent = som(to);
      return;
    }

    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 520);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = from + (to - from) * eased;
      shown.current = v;
      el.textContent = som(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span ref={ref} aria-hidden='true'>
      {som(initial)}
    </span>
  );
}

export default function Calculator() {
  const [turnover, setTurnover] = useState(450_000);
  const [rate, setRate] = useState<(typeof RATES)[number]>(0.25);
  const [share, setShare] = useState(0.3);
  const [announce, setAnnounce] = useState('');
  const id = useId();

  const moved = turnover * share;
  const theirFee = moved * rate;
  const ourFee = moved * IMENU_RATE;
  const savedYear = (theirFee - ourFee) * 12;

  // Скринридеру — итог после паузы, а не каждый шаг ползунка.
  useEffect(() => {
    const t = setTimeout(() => {
      setAnnounce(`За год у вас останется ${som(savedYear)}`);
    }, 700);
    return () => clearTimeout(t);
  }, [savedYear]);

  const turnoverMin = 50_000;
  const turnoverMax = 3_000_000;
  const turnoverFill = ((turnover - turnoverMin) / (turnoverMax - turnoverMin)) * 100;
  const shareFill = ((share - 0.1) / 0.9) * 100;

  return (
    <section className='lp-calc' id='calculator' aria-labelledby={`${id}-title`}>
      <div className='lp-wrap'>
        <div className='lp-calc__head'>
          <h2 className='lp-h2' id={`${id}-title`}>
            Сколько останется у вас
          </h2>
          <p className='lp-lead lp-lead--on-dark'>
            Введите оборот, который сейчас идёт через агрегаторы, и посмотрите,
            сколько вы перестанете отдавать в виде комиссии.
          </p>
        </div>

        <div className='lp-calc__grid'>
          <div className='lp-calc__controls'>
            <div className='lp-field'>
              <div className='lp-field__row'>
                <label htmlFor={`${id}-turnover`} className='lp-field__label'>
                  Оборот через агрегаторы в месяц
                </label>
                <output htmlFor={`${id}-turnover`} className='lp-field__value'>
                  {som(turnover)}
                </output>
              </div>
              <input
                id={`${id}-turnover`}
                type='range'
                className='lp-range'
                min={turnoverMin}
                max={turnoverMax}
                step={10_000}
                value={turnover}
                onChange={(e) => setTurnover(Number(e.target.value))}
                style={{ '--fill': `${turnoverFill}%` } as React.CSSProperties}
              />
            </div>

            <fieldset className='lp-field'>
              <legend className='lp-field__label'>Комиссия вашего агрегатора</legend>
              <div className='lp-segment'>
                {RATES.map((r) => (
                  <label key={r} className='lp-segment__opt'>
                    <input
                      type='radio'
                      name={`${id}-rate`}
                      value={r}
                      checked={rate === r}
                      onChange={() => setRate(r)}
                    />
                    <span>{Math.round(r * 100)}%</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className='lp-field'>
              <div className='lp-field__row'>
                <label htmlFor={`${id}-share`} className='lp-field__label'>
                  Какую часть этих заказов переведёте на прямые
                </label>
                <output htmlFor={`${id}-share`} className='lp-field__value'>
                  {Math.round(share * 100)}%
                </output>
              </div>
              <input
                id={`${id}-share`}
                type='range'
                className='lp-range'
                min={0.1}
                max={1}
                step={0.05}
                value={share}
                onChange={(e) => setShare(Number(e.target.value))}
                style={{ '--fill': `${shareFill}%` } as React.CSSProperties}
              />
            </div>
          </div>

          <div className='lp-calc__result'>
            <div className='lp-bars'>
              <div className='lp-bar'>
                <div className='lp-bar__row'>
                  <span>Агрегатор забрал бы в месяц</span>
                  <TweenNumber value={theirFee} />
                </div>
                <div className='lp-bar__track'>
                  <div
                    className='lp-bar__fill lp-bar__fill--them'
                    style={{ '--w': rate } as React.CSSProperties}
                  />
                </div>
              </div>
              <div className='lp-bar'>
                <div className='lp-bar__row'>
                  <span>Комиссия iMenu в месяц</span>
                  <TweenNumber value={ourFee} />
                </div>
                <div className='lp-bar__track'>
                  <div
                    className='lp-bar__fill lp-bar__fill--us'
                    style={{ '--w': IMENU_RATE } as React.CSSProperties}
                  />
                </div>
              </div>
              <p className='lp-bars__scale'>
                Вся шкала — ваш оборот по этим заказам. Заливка — сколько из
                него уходит на комиссию.
              </p>
            </div>

            <div className='lp-calc__total'>
              <span className='lp-calc__total-label'>За год у вас останется</span>
              <span className='lp-calc__total-value'>
                <TweenNumber value={savedYear} />
              </span>
            </div>

            <p className='lp-calc__note'>
              Расчёт ориентировочный и сравнивает только комиссию с заказа.
              Точные условия фиксируем в договоре.
            </p>
            <p className='lp-sr' aria-live='polite'>
              {announce}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
