import { DateFormatStyles } from "@ngneat/transloco-locale";

export type ConfigOptionsType =
  | "lang"
  | "firstDayOfWeek"
  | "assignmentHeaderTitle"
  | "defaultFooterNoteId"
  | "defaultReportFontSize"
  | "defaultReportDateColor"
  | "defaultReportDateFormat"
  | "assignmentsItemsPerPage";

export interface ConfigInterface {
  lang?: string;
  firstDayOfWeek?: number;
  assignmentHeaderTitle?: string;
  defaultFooterNoteId?: string;
  defaultReportFontSize?: string;
  defaultReportDateColor?: string;
  defaultReportDateFormat?: DateFormatStyles;
  assignmentsItemsPerPage: number;
}
