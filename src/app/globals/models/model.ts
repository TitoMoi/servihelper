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

export const S21HeaderFieldCodes = {
  name: '900_1_Text_SanSerif',
  birthDate: '900_2_Text_SanSerif',
  baptismDate: '900_5_Text_SanSerif',
  men: '900_3_CheckBox',
  women: '900_4_CheckBox',
  otherSheeps: '900_6_CheckBox',
  anointed: '900_7_CheckBox',
  elder: '900_8_CheckBox',
  ministerialServant: '900_9_CheckBox',
  regularPioneer: '900_10_CheckBox',
  specialPioneer: '900_11_CheckBox',
  missionary: '900_12_CheckBox'
} as const;

export type S21HeaderFieldCodesType = keyof typeof S21HeaderFieldCodes;
