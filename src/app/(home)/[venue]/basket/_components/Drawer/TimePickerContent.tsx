'use client';

import React from 'react';
import { generateTimeSlots } from './helpers';

type Props = {
  pickupMode: 'asap' | 'time';
  timeInput: string;
  setTimeInput: (t: string) => void;
  onChooseAsap: () => void;
  onSaveTime: () => void;
  onCancel: () => void;
};

export default function TimePickerContent({
  pickupMode,
  timeInput,
  setTimeInput,
  onChooseAsap,
  onSaveTime,
  onCancel,
}: Props) {
  const slots = React.useMemo(() => generateTimeSlots({ stepMinutes: 15, count: 12 }), []);

  return (
    <div>
      <h2 className="text-base font-semibold mb-3">Время выдачи</h2>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onChooseAsap}
          className={`w-full px-4 py-3 text-left rounded-lg border ${
            pickupMode === 'asap' ? 'border-[#FF7A00] bg-[#FFF5EE]' : 'border-[#E5E7EB]'
          }`}
        >
          Быстрее всего
        </button>

        <div className="rounded-lg border border-[#E5E7EB] p-3">
          <div className="text-sm text-[#6B7280] mb-2">Указать время</div>
          <input
            type="time"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            className="w-full rounded-md border border-[#E5E7EB] p-2"
          />

          <div className="mt-3">
            <div className="text-xs text-[#6B7280] mb-1">Быстрый выбор</div>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeInput(t)}
                  className={`px-2 py-1 rounded-md border text-sm ${
                    t === timeInput ? 'border-[#FF7A00] bg-[#FFF5EE]' : 'border-[#E5E7EB]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-[#F5F5F5] text-[#111111]"
              onClick={onCancel}
            >
              Отмена
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-[#FF7A00] text-white"
              onClick={onSaveTime}
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
