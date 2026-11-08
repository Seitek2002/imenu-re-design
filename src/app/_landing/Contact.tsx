'use client';

import { useId, useState } from 'react';

import { CONTACTS, INTERESTS, VENUE_TYPES } from './content';

/**
 * Заявка без бэкенда: форма собирает текст и открывает WhatsApp с готовым
 * сообщением на номер отдела подключения. Гостю остаётся нажать «Отправить».
 */
export default function Contact() {
  const id = useId();
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Бишкек');
  const [type, setType] = useState<string>(VENUE_TYPES[1]);
  const [interests, setInterests] = useState<string[]>([INTERESTS[0]]);

  const toggleInterest = (value: string) =>
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const lines = [
      'Здравствуйте! Хочу подключить заведение к iMenu.',
      `Заведение: ${venue.trim()}`,
      `Формат: ${type}`,
      `Город: ${city.trim() || 'Бишкек'}`,
    ];
    if (interests.length) lines.push(`Интересует: ${interests.join(', ')}`);
    const url = `https://wa.me/${CONTACTS.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className='lp-contact' id='contact' aria-labelledby={`${id}-title`}>
      <div className='lp-wrap lp-contact__grid'>
        <div className='lp-contact__copy'>
          <h2 className='lp-contact__title' id={`${id}-title`}>
            Обсудим ваше заведение?
          </h2>
          <p className='lp-lead lp-lead--on-dark'>
            Заполните заявку: она откроется в WhatsApp с готовым текстом, вам
            останется нажать «Отправить». Или свяжитесь с нами напрямую.
          </p>
          <ul className='lp-contact__direct'>
            <li>
              <span>Телефон</span>
              <a href={`tel:${CONTACTS.tel}`}>{CONTACTS.phone}</a>
            </li>
            <li>
              <span>WhatsApp</span>
              <a href={CONTACTS.whatsapp} target='_blank' rel='noopener noreferrer'>
                Написать в WhatsApp
              </a>
            </li>
            <li>
              <span>Почта</span>
              <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>
            </li>
          </ul>
        </div>

        <form className='lp-form' onSubmit={onSubmit}>
          <div className='lp-form__field'>
            <label htmlFor={`${id}-venue`}>Название заведения</label>
            <input
              id={`${id}-venue`}
              name='venue'
              required
              autoComplete='organization'
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder='Например, «Чайхана на Токтогула»'
            />
          </div>

          <div className='lp-form__field'>
            <label htmlFor={`${id}-city`}>Город</label>
            <input
              id={`${id}-city`}
              name='city'
              autoComplete='address-level2'
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <fieldset className='lp-form__field'>
            <legend>Формат</legend>
            <div className='lp-chips'>
              {VENUE_TYPES.map((t) => (
                <label key={t} className='lp-chip'>
                  <input
                    type='radio'
                    name='type'
                    value={t}
                    checked={type === t}
                    onChange={() => setType(t)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className='lp-form__field'>
            <legend>Что интересует</legend>
            <div className='lp-chips'>
              {INTERESTS.map((t) => (
                <label key={t} className='lp-chip'>
                  <input
                    type='checkbox'
                    name='interests'
                    value={t}
                    checked={interests.includes(t)}
                    onChange={() => toggleInterest(t)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button type='submit' className='lp-btn lp-btn--primary lp-btn--block'>
            Отправить заявку в WhatsApp
          </button>
        </form>
      </div>
    </section>
  );
}
