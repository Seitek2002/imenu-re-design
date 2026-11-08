'use client';

import { useEffect, useRef, useState } from 'react';

import { FEATURES, type PreviewId } from './content';
import Preview from './Preview';

/**
 * Возможности, свёрстанные как меню ресторана: позиция, описание, отточие
 * и «цена» — эффект для заведения. Справа «тарелка» (sticky, только десктоп)
 * показывает, как позиция выглядит у гостя или у вас. Активная позиция —
 * та, что под курсором; без курсора — та, что ближе к центру экрана.
 */
export default function Features() {
  const [scrollActive, setScrollActive] = useState<PreviewId>('qr-table');
  const [hoverActive, setHoverActive] = useState<PreviewId | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const active = hoverActive ?? scrollActive;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-preview]'));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setScrollActive(entry.target.getAttribute('data-preview') as PreviewId);
          }
        }
      },
      { rootMargin: '-48% 0px -48% 0px' },
    );
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return (
    <section className='lp-features' id='features' aria-labelledby='features-title'>
      <div className='lp-wrap'>
        <div className='lp-features__head'>
          <h2 className='lp-h2' id='features-title'>
            Меню возможностей
          </h2>
          <p className='lp-lead'>
            Всё, что получает заведение, работает в одной системе. У каждой
            позиции указан эффект, который она даёт.
          </p>
        </div>

        <div className='lp-features__grid'>
          <div className='lp-menu' ref={listRef} onMouseLeave={() => setHoverActive(null)}>
            {FEATURES.map((course) => (
              <div key={course.title} className='lp-menu__course'>
                <h3 className='lp-menu__course-title'>{course.title}</h3>
                <ul className='lp-menu__list'>
                  {course.items.map((item) => (
                      <li
                        key={item.id}
                        className='lp-menu__item'
                        data-preview={item.id}
                        data-active={active === item.id ? '' : undefined}
                        onMouseEnter={() => setHoverActive(item.id)}
                      >
                        <div className='lp-menu__line'>
                          <span className='lp-menu__name'>{item.name}</span>
                          <span className='lp-menu__leader' aria-hidden='true' />
                          <span className='lp-menu__effect'>{item.effect}</span>
                        </div>
                        <p className='lp-menu__text'>{item.text}</p>
                      </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className='lp-menu__note'>
              Эффект указан по итогам первого года работы заведений с iMenu.
            </p>
          </div>

          <div className='lp-plate-col' aria-hidden='true'>
            <div className='lp-dish'>
              <div className='lp-dish__plate'>
                <div key={active} className='lp-dish__serve'>
                  <Preview id={active} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
