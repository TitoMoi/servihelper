import { AssignTypeInterface } from "app/assigntype/model/assigntype.model";
import {
  ParticipantDynamicInterface,
  ParticipantInterface,
} from "app/participant/model/participant.model";
import { RoomInterface } from "app/room/model/room.model";

type AssignmentOperationType = "create" | "update" | "delete"; //get is excluded

export interface AssignmentOperationInterface {
  assignment: AssignmentInterface;
  operationType: AssignmentOperationType;
}

export interface AssignmentInterface {
  id: string;
  date: Date;
  sheetTitle?: string;
  room: string;
  assignType: string;
  theme: string;
  isPTheme: boolean; //isPublicTheme means the theme is an string id and not a string literal
  onlyWoman: boolean;
  onlyMan: boolean;
  onlyExternals: boolean;
  principal: string;
  group?: number;
  assistant: string;
  footerNote: string;
}

export interface AssignmentReportInterface {
  id: string;
  date: Date;
  sheetTitle?: string;
  room: RoomInterface;
  assignType: AssignTypeInterface;
  theme: string;
  isPTheme: boolean; //isPublicTheme means the theme is an string id and not a string literal
  onlyWoman: boolean;
  onlyMan: boolean;
  principal: ParticipantInterface;
  assistant: ParticipantInterface;
  footerNote: string;
}

export interface AssignmentGroupInterface {
  assignments: AssignmentReportInterface[];
}

export interface AssignmentTableInterface extends AssignmentInterface {
  hasDateSeparator: boolean; //To separate dates from one day to another
  hasBeenClicked: boolean; //To highlight last row when clicked the sheet
}

export interface CloseAssignmentsDataContext {
  assignments: AssignmentInterface[];
  isRedClock: boolean;
}

export interface StarvingAssignmentsDataContext {
  participants: ParticipantDynamicInterface[];
  isSchool: boolean;
  isPrayer: boolean;
  isTreasuresEtc: boolean;
}
