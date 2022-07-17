import { DateFormatStyles } from "@ngneat/transloco-locale";

export type ConfigOptionsType =
  | "lang"
  | "firstDayOfWeek"
  | "assignmentHeaderTitle"
  | "defaultFooterNoteId"
  | "defaultReportFontSize"
  | "defaultReportDateColor"
  | "defaultWeekDayBegins"
  | "defaultReportDateFormat";

export interface WeekDaysBegin {
  name: string;
  value: number;
}

export interface ConfigInterface {
  lang?: string;
  firstDayOfWeek?: number;
  assignmentHeaderTitle?: string;
  defaultFooterNoteId?: string;
  defaultReportFontSize?: string;
  defaultReportDateColor?: string;
  defaultWeekDayBegins: number;
  defaultReportDateFormat?: DateFormatStyles;
}
