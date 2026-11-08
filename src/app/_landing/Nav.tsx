'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { CONTACTS, NAV_LINKS } from './content';

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 32 32' className={className} aria-hidden='true'>
      <rect width='32' height='32' rx='16' fill='#FD0151' />
      <path d='M21.5 18.76a5.5 5.75 0 0 0-11 0Z' fill='#fff' />
      <path d='M9.5 19.11h13v1.75h-13Z' fill='#fff' />
      <circle cx='16' cy='11.94' r='.86' fill='#fff' />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg viewBox='0 0 24 24' width='18' height='18' fill='none' aria-hidden='true'>
      <path
        d='M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4M8 12h8'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
      />
    </svg>
  );
}

export default function Nav() {
  const [pastHero, setPastHero] = useState(false);
  const [atContact, setAtContact] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('top');
    const contact = document.getElementById('contact');
    if (!hero) return;

    const heroObserver = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      // Плавающая панель появляется, когда низ hero уходит за верхние 8% экрана.
      { rootMargin: '0px 0px -92% 0px', threshold: 0 },
    );
    heroObserver.observe(hero);

    let contactObserver: IntersectionObserver | undefined;
    if (contact) {
      contactObserver = new IntersectionObserver(
        ([entry]) => setAtContact(entry.isIntersecting),
        { threshold: 0.15 },
      );
      contactObserver.observe(contact);
    }

    return () => {
      heroObserver.disconnect();
      contactObserver?.disconnect();
    };
  }, []);

  return (
    <>
      <header
        className='lp-header'
        data-hidden={pastHero ? '' : undefined}
        inert={pastHero}
      >
        <div className='lp-wrap lp-header__row'>
          <a href='#top' className='lp-brand' aria-label='iMenu, наверх'>
            <Mark className='lp-brand__mark' />
            <span className='lp-brand__word'>iMenu</span>
          </a>

          <nav className='lp-header__links' aria-label='Разделы'>
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className='lp-header__actions'>
            <Link
              href={CONTACTS.scanHref}
              className='lp-header__scan'
              aria-label='Я гость, сканировать QR'
            >
              <QrIcon />
              <span>Я гость, сканировать QR</span>
            </Link>
            <a href='#contact' className='lp-btn lp-btn--light lp-btn--sm'>
              Обсудить подключение
            </a>
          </div>
        </div>
      </header>

      <div
        className='lp-pill'
        data-show={pastHero && !atContact ? '' : undefined}
        aria-hidden={!pastHero || atContact}
        inert={!pastHero || atContact}
      >
        <a href='#top' className='lp-pill__brand' aria-label='iMenu, наверх'>
          <Mark className='lp-brand__mark' />
        </a>
        <nav className='lp-pill__links' aria-label='Разделы'>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <Link href={CONTACTS.demoHref} className='lp-pill__demo'>
          Демо
        </Link>
        <a href='#contact' className='lp-btn lp-btn--primary lp-btn--sm'>
          Обсудить подключение
        </a>
      </div>
    </>
  );
}
