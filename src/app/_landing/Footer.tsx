import Link from 'next/link';

import { CONTACTS, NAV_LINKS } from './content';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className='lp-footer'>
      <div className='lp-wrap'>
        <div className='lp-footer__row'>
          <nav className='lp-footer__nav' aria-label='Разделы'>
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className='lp-footer__nav'>
            <Link href={CONTACTS.demoHref}>Демо-меню</Link>
            <Link href={CONTACTS.scanHref}>Сканировать QR-код</Link>
            <a href={`tel:${CONTACTS.tel}`}>{CONTACTS.phone}</a>
            <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>
          </div>
        </div>
        <div className='lp-footer__legal'>
          <span>© {year} iMenu.kg</span>
          <span>Бишкек, Кыргызстан</span>
        </div>
      </div>
      <div className='lp-footer__word' aria-hidden='true'>
        iMenu
      </div>
    </footer>
  );
}
