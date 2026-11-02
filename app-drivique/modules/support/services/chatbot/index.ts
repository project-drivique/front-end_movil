import { intent01, intent02, intent03, intent04, intent05, intent06, intent07, intent08 } from './intents1';
import { intent09, intent10, intent11, intent12, intent13, intent14, intent15, intent16 } from './intents2';
import { intent17 } from './intents3';
import type { IntentContext, IntentResult } from './types';

// Se evalúan en orden: la primera que reconoce el mensaje responde.
export const INTENTS: ((ctx: IntentContext) => IntentResult | null)[] = [
  intent01,
  intent02,
  intent03,
  intent04,
  intent05,
  intent06,
  intent07,
  intent08,
  intent09,
  intent10,
  intent11,
  intent12,
  intent13,
  intent14,
  intent15,
  intent16,
  intent17,
];
