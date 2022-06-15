export type ConfigOptionsType =
  | "lang"
  | "firstDayOfWeek"
  | "assignmentHeaderTitle"
  | "defaultFooterNoteId";

export interface ConfigInterface {
  lang?: string;
  firstDayOfWeek?: number;
  assignmentHeaderTitle?: string;
  defaultFooterNoteId?: string;
}
