export const S21MonthCodesConst = {
  September: '20',
  October: '21',
  November: '22',
  December: '23',
  January: '24',
  February: '25',
  March: '26',
  April: '27',
  May: '28',
  June: '29',
  July: '30',
  August: '31'
} as const;

export type MonthCodesType = keyof typeof S21MonthCodesConst;

export const S21FieldCodes = {
  hasParticipated: '901_XX_CheckBox',
  hasBibleStudies: '902_XX_Text_C_SanSerif',
  isPioneer: '903_XX_CheckBox',
  hours: '904_XX_S21_Value',
  notes: '905_XX_Text_SanSerif',
  totalHours: '904_32_S21_Value'
} as const;

export type S21FieldCodesType = keyof typeof S21FieldCodes;
