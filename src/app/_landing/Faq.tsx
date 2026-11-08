import { FAQ } from './content';

// Нативные <details>: работают без JS, раскрытие анимируется в CSS
// (::details-content + interpolate-size там, где поддерживается).
export default function Faq() {
  return (
    <section className='lp-faq' id='faq' aria-labelledby='faq-title'>
      <div className='lp-wrap lp-faq__grid'>
        <h2 className='lp-h2' id='faq-title'>
          Частые вопросы
        </h2>
        <div className='lp-faq__list'>
          {FAQ.map((item) => (
            <details key={item.q} className='lp-faq__item' name='lp-faq'>
              <summary className='lp-faq__q'>
                <span>{item.q}</span>
                <span className='lp-faq__icon' aria-hidden='true' />
              </summary>
              <p className='lp-faq__a'>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
