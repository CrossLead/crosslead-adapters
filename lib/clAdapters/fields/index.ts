/**
 * Adapter data fields
 * @return {Fields}
 1*/

import { Types as _Types } from './types';
export const Types = _Types;

export interface Field {
  type: _Types;
  extId: string;
}