import { DateFormatStyles } from "@ngneat/transloco-locale";
import { RoleInterface } from "app/roles/model/role.model";
import { LatLngLiteral } from "leaflet";

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
  | "lastMapClick"
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
  lastMapClick: LatLngLiteral;
  roles?: RoleInterface[];
  role?: string;
}
