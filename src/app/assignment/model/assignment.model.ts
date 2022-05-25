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

export interface AssignmentGroup {
  date: Date;
  assignments: AssignmentInterface[];
}

export interface AssignmentTableInterface {
  id: string;
  date: Date;
  room: string;
  assignType: string;
  theme: string;
  principal: string;
  assistant: string;
}
