import { MANIFESTO } from './content';

// Абзац-обращение к партнёру. Слова «зажигаются» по мере чтения: каждое слово
// знает свой индекс (--i), а прозрачность считается в CSS из --p секции.
export default function Manifesto() {
  const words = MANIFESTO.split(' ');

  return (
    <section className='lp-manifesto' aria-label='Предложение'>
      <div className='lp-wrap'>
        <p
          className='lp-manifesto__text'
          data-fx='read'
          style={{ '--n': words.length } as React.CSSProperties}
        >
          {words.map((word, i) => (
            <span
              key={i}
              className='lp-word'
              style={{ '--i': i } as React.CSSProperties}
            >
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
