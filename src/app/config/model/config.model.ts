export type ConfigOptionsType =
  | "lang"
  | "firstDayOfWeek"
  | "assignmentHeaderTitle"
  | "defaultFooterNoteId"
  | "defaultReportFontSize"
  | "defaultReportDateColor"
  | "defaultReportDateFormat";

export interface ConfigInterface {
  lang?: string;
  firstDayOfWeek?: number;
  assignmentHeaderTitle?: string;
  defaultFooterNoteId?: string;
  defaultReportFontSize?: string;
  defaultReportDateColor?: string;
  defaultReportDateFormat?: string;
}
