export interface AssignmentInterface {
  id: string;
  date: Date;
  room: string; //Room
  assignType: string; //AssignType
  theme: string;
  onlyWoman: boolean;
  onlyMan: boolean;
  principal: string; //participant
  assistant: string; //participant
  footerNote: string;
}

export interface AssignmentTableInterface {
  id: string;
  date: Date;
  room: string; //Room
  assignType: string; //AssignType
  theme: string;
  onlyWoman: boolean;
  onlyMan: boolean;
  principal: string; //participant
  assistant: string; //participant
  footerNote: string;
}
