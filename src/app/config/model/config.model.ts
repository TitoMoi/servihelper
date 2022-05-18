export type ConfigOptionsType =
  | "assignmentHeaderTitle"
  | "firstDayOfWeek"
  | "lang";

export interface ConfigInterface {
  lang?: string;
  firstDayOfWeek?: number;
  assignmentHeaderTitle?: string;
}
