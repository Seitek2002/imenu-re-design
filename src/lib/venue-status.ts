export type Schedule = {
  dayOfWeek: number; // 1 - Понедельник, 7 - Воскресенье
  workStart: string; // "10:00"
  workEnd: string; // "05:00" или "22:00"
  isDayOff: boolean;
  is24h: boolean;
};

export interface VenueStatus {
  isOpen: boolean;
  message: string;
}

export function getVenueStatus(schedules: Schedule[]): VenueStatus {
  // --- 🌍 FIX TIMEZONE START ---
  // 1. Берем текущее время сервера (Франция/Германия)
  const serverDate = new Date();

  // 2. Конвертируем его в строку времени Бишкека
  const bishkekTimeStr = serverDate.toLocaleString('en-US', {
    timeZone: 'Asia/Bishkek',
  });

  // 3. Создаем объект даты, который "думает", что он в Бишкеке
  const now = new Date(bishkekTimeStr);
  // --- 🌍 FIX TIMEZONE END ---

  // ВАЖНО: Получаем текущее время в минутах от начала дня (0..1439)
  // Теперь getHours() вернет время Бишкека, а не сервера
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // JS возвращает 0 (Вс) - 6 (Сб). Нам нужно 1 (Пн) - 7 (Вс)
  let currentDay = now.getDay();
  currentDay = currentDay === 0 ? 7 : currentDay;

  // --- 1. ПРОВЕРКА: Не находимся ли мы в "ночной смене" вчерашнего дня? ---
  // (Например, сейчас Суббота 02:00, а Пятница работает до 05:00)
  const yesterdayDay = currentDay === 1 ? 7 : currentDay - 1;
  const yesterdaySchedule = schedules.find((s) => s.dayOfWeek === yesterdayDay);

  if (yesterdaySchedule && !yesterdaySchedule.isDayOff) {
    const start = parseTime(yesterdaySchedule.workStart);
    const end = parseTime(yesterdaySchedule.workEnd);

    // Если смена переходит через полночь (конец меньше начала)
    if (end < start) {
      // И текущее время меньше времени закрытия (например, сейчас 02:00, а закрытие в 05:00)
      if (currentMinutes < end) {
        return {
          isOpen: true,
          message: `Закроется в ${yesterdaySchedule.workEnd}`,
        };
      }
    }
  }

  // --- 2. ПРОВЕРКА: Текущий день ---
  const todaySchedule = schedules.find((s) => s.dayOfWeek === currentDay);

  if (todaySchedule && !todaySchedule.isDayOff) {
    const start = parseTime(todaySchedule.workStart);
    const end = parseTime(todaySchedule.workEnd);

    // Логика "внутри рабочего дня"
    // Если смена обычная (10:00 - 22:00)
    if (start < end) {
      if (currentMinutes >= start && currentMinutes < end) {
        return {
          isOpen: true,
          message: `Закроется в ${todaySchedule.workEnd}`,
        };
      }
    }
    // Если смена через полночь (10:00 - 05:00)
    else {
      if (currentMinutes >= start) {
        // Мы уже начали работать сегодня и будем работать до ночи
        return {
          isOpen: true,
          message: `Закроется в ${todaySchedule.workEnd}`,
        };
      }
    }
  }

  // --- 3. ЕСЛИ ЗАКРЫТО: Ищем следующее открытие ---
  // Проверяем оставшуюся часть сегодня и следующие дни

  // Может открыться сегодня позже?
  if (todaySchedule && !todaySchedule.isDayOff) {
    const start = parseTime(todaySchedule.workStart);
    if (currentMinutes < start) {
      return {
        isOpen: false,
        message: `Откроется сегодня в ${todaySchedule.workStart}`,
      };
    }
  }

  // Ищем в ближайшие дни
  for (let i = 1; i <= 7; i++) {
    let nextDay = currentDay + i;
    if (nextDay > 7) nextDay -= 7;

    const nextSchedule = schedules.find((s) => s.dayOfWeek === nextDay);
    if (nextSchedule && !nextSchedule.isDayOff) {
      const dayName = i === 1 ? 'завтра' : getDayName(nextDay);
      return {
        isOpen: false,
        message: `Ждем вас ${dayName} с ${nextSchedule.workStart}`,
      };
    }
  }

  return { isOpen: false, message: 'Временно закрыто' };
}

// Хелпер: переводит "10:30" в 630 минут
function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function getDayName(dayIdx: number): string {
  const days = [
    'в понедельник',
    'во вторник',
    'в среду',
    'в четверг',
    'в пятницу',
    'в субботу',
    'в воскресенье',
  ];
  return days[dayIdx - 1];
}
