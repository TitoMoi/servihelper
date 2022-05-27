export interface ParticipantInterface {
  id: string;
  name: string;
  isWoman: boolean;
  onlyAssistant: boolean;
  rooms: ParticipantRoomInterface[];
  assignTypes: ParticipantAssignTypesInterface[];
  available: boolean;
  count: number; //Dynamic value, undefined by default
  hasWork: boolean; //Dynamic, if has current assignments for the date
  lastAssignmentDate: Date; //Dynamic value, undefined by default, date of last assignment
  penultimateAssignmentDate: Date; //Dynamic value, undefined by default, date of penultimate assignment
  distanceBetweenPenultimaAndLast: string; //Dynamic value, undefined by default, string in distance
  lastAssignType: string; //Dynamic value, undefined by default, the name of the assignType
  penultimateAssignType: string; //Dynamic value, undefined by default, the name of the assignType
}

export interface ParticipantRoomInterface {
  roomId: string;
  available: boolean;
}

export interface ParticipantAssignTypesInterface {
  assignTypeId: string;
  canPrincipal: boolean;
  canAssistant: boolean;
}

export interface ParticipantTableInterface {
  id: string;
  name: string;
}
