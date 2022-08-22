import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { RoomInterface } from "app/room/model/room.model";

export interface AssignmentInterface {
  id: string;
  date: Date;
  room: string;
  assignType: string;
  theme: string;
  onlyWoman: boolean;
  onlyMan: boolean;
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

export interface AssignmentTableInterface {
  id: string;
  date: Date;
  hasDateSeparator: boolean; //To separate dates from one day to another
  hasBeenClicked: boolean; //To highlight last row when clicked the sheet
  room: string;
  assignType: string;
  assignTypeColor: string;
  theme: string;
  principal: string;
  assistant: string;
}
