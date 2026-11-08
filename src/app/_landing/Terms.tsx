import { CONTACTS, RECEIPT } from './content';

// Условия в виде кассового чека: строка = условие, зачёркнуто — как у
// агрегаторов, рядом — как в iMenu. Чек «печатается» по мере скролла.
export default function Terms() {
  const year = new Date().getFullYear();

  return (
    <section className='lp-terms' id='terms' aria-labelledby='terms-title'>
      <div className='lp-wrap lp-terms__grid'>
        <div className='lp-terms__copy'>
          <h2 className='lp-h2' id='terms-title'>
            Условия сотрудничества
          </h2>
          <p className='lp-lead'>
            Подключение бесплатное, комиссия 1,5% с заказа. Для сравнения мы
            оставили в чеке типичные условия агрегаторов.
          </p>
          <p className='lp-lead'>
            Вы зарабатываете на своих гостях, а не отдаёте платформе четверть
            выручки с каждого заказа.
          </p>
          <a href='#contact' className='lp-btn lp-btn--primary'>
            Обсудить подключение
          </a>
        </div>

        <div className='lp-printer' data-fx='view'>
          <div className='lp-printer__slot' aria-hidden='true' />
          <div className='lp-printer__paper'>
            <div className='lp-receipt'>
              <div className='lp-receipt__head'>
                <b>iMenu.kg</b>
                <span>Предложение для партнёра</span>
                <span>Бишкек, {year}</span>
              </div>
              <div className='lp-receipt__rule' aria-hidden='true' />
              <table className='lp-receipt__table'>
                <caption className='lp-sr'>
                  Условия iMenu в сравнении с агрегаторами
                </caption>
                <thead className='lp-sr'>
                  <tr>
                    <th scope='col'>Условие</th>
                    <th scope='col'>У агрегаторов</th>
                    <th scope='col'>В iMenu</th>
                  </tr>
                </thead>
                <tbody>
                  {RECEIPT.map((row) => (
                    <tr key={row.label}>
                      <th scope='row'>{row.label}</th>
                      <td className='lp-receipt__them'>
                        <s>{row.them}</s>
                      </td>
                      <td className='lp-receipt__us'>{row.us}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className='lp-receipt__rule' aria-hidden='true' />
              <div className='lp-receipt__total'>
                <span>К оплате сейчас</span>
                <b>0 сом</b>
              </div>
              <div className='lp-receipt__rule' aria-hidden='true' />
              <p className='lp-receipt__thanks'>
                Спасибо, что работаете
                <br />
                с гостями напрямую
              </p>
              <span className='lp-receipt__barcode' aria-hidden='true' />
              <span className='lp-receipt__foot'>{CONTACTS.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
