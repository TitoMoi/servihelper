import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { RoomInterface } from "app/room/model/room.model";

type AssignmentOperationType = "create" | "update" | "delete"; //get is excluded

export interface AssignmentOperationInterface {
  assignment: AssignmentInterface;
  insertedIndex?: number; //This is the position of the assignment in the array after sorted
  operationType: AssignmentOperationType;
}

export interface AssignmentInterface {
  id: string;
  date: Date;
  room: string;
  assignType: string;
  theme: string;
  onlyWoman: boolean;
  onlyMan: boolean;
  onlyExternals: boolean;
  principal: string;
  assistant: string;
  footerNote: string;
}

export interface AssignmentReportInterface {
  id: string;
  date: Date;
  room: RoomInterface;
  assignType: AssignTypeInterface;
  theme: string;
  onlyWoman: boolean;
  onlyMan: boolean;
  principal: ParticipantInterface;
  assistant: ParticipantInterface;
  footerNote: string;
}

export interface AssignmentGroupInterface {
  date: Date;
  roomName: string;
  assignments: AssignmentReportInterface[];
}

export interface AssignmentTableInterface extends AssignmentInterface {
  hasDateSeparator: boolean; //To separate dates from one day to another
  hasBeenClicked: boolean; //To highlight last row when clicked the sheet
}
