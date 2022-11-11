import { DateFormatStyles } from "@ngneat/transloco-locale";
import { RoleInterface } from "app/roles/model/role.model";

export type ConfigOptionsType =
  | "lang"
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
  | "defaultReportDateFormat"
  | "reportTitle"
  | "roles"
  | "role";

export interface WeekDaysBegin {
  name: string;
  value: number;
}

export interface ConfigInterface {
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
  roles?: RoleInterface[];
  role?: string;
}
