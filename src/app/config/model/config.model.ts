import { DateFormatStyles } from '@jsverse/transloco-locale';
import { RoleInterface } from 'app/roles/model/role.model';
import { LatLngLiteral } from 'leaflet';

export type ConfigOptionsType = keyof ConfigInterface;

export interface WeekDaysBegin {
  name: string;
  value: number;
}

export interface ConfigInterface {
  lang?: string;
  defaultFooterNoteId?: string;
  defaultReportFontSize: number;
  defaultReportFontSizeHorizontal: number;
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
  role?: string; //id
  lastImportedDate: Date;
  lastImportedFilename: string;
  lastExportedDate: Date;
  closeToOthersDays: number;
  closeToOthersPrayerDays: number;
  closeToOthersTreasuresEtcDays: number;
  isClassicSortEnabled: boolean;
  s89Title1: string;
  s89Title2: string;
  s89Principal: string;
  s89Assistant: string;
  s89Date: string;
  s89Number: string;
  s89RoomsTitle: string;
  s89NoteBoldPart: string;
  s89NoteContentPart: string;
  s89Version: string;
  s89DateVersion: string;
  s13Title: string;
  s13YearService: string;
  s13TerrNumber: string;
  s13LastCompletedDate: string;
  s13AssignedTo: string;
  s13AssignedDate: string;
  s13CompletedDate: string;
}

export interface OnlineTemplateDataInterface {
  msgKey: string; //key for the i18n
  isOnline: boolean;
}
