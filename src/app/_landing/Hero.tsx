import Link from 'next/link';

import { CONTACTS, HERO } from './content';
import PhoneMock from './PhoneMock';

// Крышка-клош из логотипа iMenu: купол + ручка. Пропорции те же, что в
// src/assets/logo.svg, только крупно.
function Lid() {
  return (
    <svg viewBox='0 0 78 51' className='lp-lid__svg'>
      <circle cx='39' cy='5' r='5' fill='currentColor' />
      <path d='M0 51 A39 39 0 0 1 78 51 Z' fill='currentColor' />
      <path
        d='M13.5 37 A29 29 0 0 1 27 20.5'
        className='lp-lid__shine'
        fill='none'
        strokeWidth='2.2'
        strokeLinecap='round'
      />
    </svg>
  );
}

function Steam() {
  return (
    <svg viewBox='0 0 120 90' className='lp-steam__svg' fill='none'>
      <path pathLength={100} d='M30 88 C 18 70, 42 58, 30 40 S 34 12, 26 2' />
      <path pathLength={100} d='M60 88 C 48 66, 72 54, 60 34 S 66 10, 58 0' />
      <path pathLength={100} d='M90 88 C 78 70, 102 58, 90 40 S 94 14, 86 4' />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className='lp-hero' id='top' data-fx='pin' data-tilt>
      <div className='lp-hero__sticky'>
        <div className='lp-hero__flood' aria-hidden='true' />

        <div className='lp-hero__grid lp-wrap'>
          <div className='lp-hero__copy'>
            <h1 className='lp-hero__title'>
              {HERO.lines.map((line, i) => (
                <span key={line} className='lp-line' style={{ '--i': i } as React.CSSProperties}>
                  {i > 0 && ' '}
                  <span className='lp-line__inner'>{line}</span>
                </span>
              ))}
            </h1>
            <p className='lp-hero__sub'>{HERO.sub}</p>
            <div className='lp-hero__ctas'>
              <a href='#contact' className='lp-btn lp-btn--light'>
                {HERO.primary}
              </a>
              <Link href={CONTACTS.demoHref} className='lp-btn lp-btn--outline-light'>
                {HERO.secondary}
              </Link>
            </div>
          </div>

          <div className='lp-hero__side'>
            <div className='lp-stage' aria-hidden='true'>
              <div className='lp-stage__tilt'>
                <div className='lp-steam'>
                  <Steam />
                </div>

                <div className='lp-stage__mask'>
                  <div className='lp-stage__phone'>
                    <PhoneMock />
                  </div>
                </div>

                <div className='lp-plate' />

                <div className='lp-lid'>
                  <Lid />
                </div>

                <div className='lp-float lp-float--tg'>
                  <span className='lp-float__icon lp-float__icon--tg'>
                    <svg viewBox='0 0 24 24' width='14' height='14' fill='currentColor'>
                      <path d='M21.4 4.3 2.9 11.4c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5ZM9.6 14.2l8.6-7.3c.4-.3-.1-.5-.6-.2l-10 6.3' />
                    </svg>
                  </span>
                  <span className='lp-float__body'>
                    <span className='lp-float__meta'>
                      <b>iMenu Бот</b>
                      <span>сейчас</span>
                    </span>
                    <span className='lp-float__text'>Новый заказ №248, стол 7</span>
                    <span className='lp-float__text lp-float__text--mute'>
                      1 240 сом, оплачен по QR
                    </span>
                  </span>
                </div>

                <div className='lp-float lp-float--bonus'>
                  <span className='lp-float__big'>+62</span>
                  <span className='lp-float__body'>
                    <span className='lp-float__text'>бонуса гостю</span>
                    <span className='lp-float__text lp-float__text--mute'>
                      +996 555 ··· 12 в вашей базе
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <p className='lp-hero__caption'>{HERO.caption}</p>
          </div>
        </div>

        <div className='lp-hero__cue' aria-hidden='true'>
          <span className='lp-hero__cue-inner'>
            <span className='lp-hero__cue-line' />
            {HERO.cue}
          </span>
        </div>
      </div>
    </section>
  );
}
