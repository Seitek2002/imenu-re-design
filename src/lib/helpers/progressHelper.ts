const STEPS_COUNT = {
  1: 3, // DineIn (В зале)
  2: 4, // Takeout (С собой)
  3: 4, // Delivery (Доставка)
};

export function calculateOrderProgress(
  status?: number,
  serviceMode?: number
): number {
  if (status === undefined || serviceMode === undefined) return 0;

  if (status === 7) return 0;

  const totalSteps = STEPS_COUNT[serviceMode as 1 | 2 | 3] || 4;

  const currentStep = Math.min(status, totalSteps - 1);

  const percent = Math.round(((currentStep + 1) / totalSteps) * 100);

  return Math.min(100, Math.max(0, percent));
}
