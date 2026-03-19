import { useMemo, useState, useEffect } from 'react';
import {
  GACHI_WORDS,
  PORN_CATEGORIES,
  SWEAR_WORDS,
  GACHI_ASCII,
} from './easterEggs.data';

// Типизируем состояние нашего квеста
export type QuestState = {
  type: 'camera';
  step: number;
};

export const useEasterEggs = (searchQuery: string) => {
  const [questState, setQuestState] = useState<QuestState | null>(null);

  // 1. Инициализация или сброс квеста при вводе
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    // Наши триггеры для запуска многошаговой игры
    if (q === 'дети' || q === 'ребенок') {
      if (!questState) {
        setQuestState({ type: 'camera', step: 1 });
      }
    } else {
      // Если пользователь стер или изменил запрос — сбрасываем квест
      setQuestState(null);
    }
  }, [searchQuery, questState]);

  // 2. Отслеживаем сворачивание вкладки/браузера (Магия тут)
  useEffect(() => {
    const handleVisibilityChange = () => {
      // document.hidden становится true, когда вкладка или браузер сворачиваются
      if (
        document.hidden &&
        questState?.type === 'camera' &&
        questState.step === 1
      ) {
        // Человек ушел в камеру, переводим игру на шаг 2
        setQuestState({ type: 'camera', step: 2 });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [questState]);

  // 3. Обычные текстовые пасхалки
  const easterEggMessage = useMemo(() => {
    // Если активен квест, не ищем обычные пасхалки
    if (questState) return null;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return null;

    if (
      q.includes('1=1') ||
      q.includes('drop table') ||
      q.includes('select *')
    ) {
      return 'Nice try, хакер. Иди лучше поешь 👨‍💻';
    }

    const words = q.replace(/[^\w\sа-яё]/gi, '').split(/\s+/);

    if (
      GACHI_WORDS.some((phrase) =>
        phrase.includes(' ') ? q.includes(phrase) : words.includes(phrase),
      )
    ) {
      return GACHI_ASCII;
    }

    if (PORN_CATEGORIES.some((word) => words.includes(word))) {
      return 'Вы ищете не на том сайте 👀\nНо мы вас не осуждаем 😇';
    }

    if (SWEAR_WORDS.some((word) => words.includes(word))) {
      return 'И этими губами ты свою маму целуешь? 🫣';
    }

    const localEggs: Record<string, string> = {
      диета: 'Какая диета? Один раз живем! 🍔',
      бесплатно: 'Бесплатный сыр только в мышеловке 🧀',
      халява: 'Бесплатный сыр только в мышеловке 🧀',
      рекурсия: 'Возможно, вы искали: рекурсия 🔄',
      наркотики: 'Чем это мы балуемся?)',
      девушка: 'Удачи с этим 🫂',
      привет: 'Пока, пока!',
      салам: 'Уалейкум родной 🤝',
      поиск:
        'Вам заняться нечем? 👀\nНам-то за такие приколы платят.\nА вы-то что?...',
    'название блюда': 'Ты шо, самый умный?\nСлишком предсказуемо)))',
    'futanari': 'Что вы делаете? 👀',
    'dildo': 'Зачем вам это? 👀',
    'член': 'Говорят что чупа-чупсы хорошая замена!',
    'хуй': 'Говорят что чупа-чупсы хорошая замена!',
    минет: 'Говорят что чупа-чупсы хорошая замена!',
    насвай: 'Дайте угадаю, вы из Баткена?)',
    };

    if (localEggs[q]) return localEggs[q];
    if (words.some((w) => localEggs[w]))
      return words.map((w) => localEggs[w]).find(Boolean) || null;

    return null;
  }, [searchQuery, questState]);

  // Возвращаем и текстовое сообщение, и состояние квеста (с функцией его обновления)
  return { easterEggMessage, questState, setQuestState };
};
