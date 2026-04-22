import { Clock, ChefHat, CheckCircle, MapPin, Utensils, LucideIcon } from 'lucide-react';

export type StepKey =
  | 'takeout.0'
  | 'takeout.1'
  | 'takeout.2'
  | 'takeout.3'
  | 'delivery.0'
  | 'delivery.1'
  | 'delivery.2'
  | 'delivery.3'
  | 'dinein.0'
  | 'dinein.1'
  | 'dinein.2';

export interface StepConfig {
  key: StepKey;
  Icon: LucideIcon;
}

export const STEPS_CONFIG: Record<number, StepConfig[]> = {
  // 2: Takeout (С собой)
  2: [
    { key: 'takeout.0', Icon: Clock },
    { key: 'takeout.1', Icon: ChefHat },
    { key: 'takeout.2', Icon: CheckCircle },
    { key: 'takeout.3', Icon: Utensils },
  ],
  // 3: Delivery (Доставка)
  3: [
    { key: 'delivery.0', Icon: Clock },
    { key: 'delivery.1', Icon: ChefHat },
    { key: 'delivery.2', Icon: MapPin },
    { key: 'delivery.3', Icon: CheckCircle },
  ],
  // 1: DineIn (В зале)
  1: [
    { key: 'dinein.0', Icon: Clock },
    { key: 'dinein.1', Icon: ChefHat },
    { key: 'dinein.2', Icon: Utensils },
  ],
};
