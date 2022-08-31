import { DateFormatStyles } from "@ngneat/transloco-locale";

export type ConfigOptionsType =
  | "lang"
  | "appVersion"
  | "assignmentHeaderTitle"
  | "assignmentPrincipalTitle"
  | "assignmentAssistantTitle"
  | "assignmentDateTitle"
  | "assignmentAssignTypeTitle"
  | "assignmentThemeTitle"
  | "assignmentRoomTitle"
  | "assignmentNoteTitle"
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
  appVersion: string;
  lang?: string;
  defaultFooterNoteId?: string;
  defaultReportFontSize?: string;
  defaultReportDateColor?: string;
  defaultWeekDayBegins: number;
  defaultReportDateFormat?: DateFormatStyles;
  assignmentHeaderTitle?: string;
  assignmentPrincipalTitle?: string;
  assignmentAssistantTitle?: string;
  assignmentDateTitle?: string;
  assignmentAssignTypeTitle?: string;
  assignmentThemeTitle?: string;
  assignmentRoomTitle?: string;
  assignmentNoteTitle?: string;
  reportTitle?: string;
}
