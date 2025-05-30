export interface ParticipantInterface {
  id?: string; //On update id is not coming from the form
  name: string;
  group?: number;
  isWoman: boolean;
  isExternal: boolean;
  rooms: ParticipantRoomInterface[];
  assignTypes: ParticipantAssignTypeInterface[];
  available: boolean;
  notAvailableDates?: Date[];
}

//These values may exist and are calculated under assignments and statistics pages but shouldnt be saved on json file
export interface ParticipantDynamicInterface extends ParticipantInterface {
  count?: number; //Dynamic value, undefined by default
  hasWork?: boolean; //Dynamic, if has current assignments for the date
  lastAssignmentDate?: Date; //Dynamic value, undefined by default, date of last assignment
  penultimateAssignmentDate?: Date; //Dynamic value, undefined by default, date of penultimate assignment
  distanceBetweenPenultimaAndLast?: string; //Dynamic value, undefined by default, string in distance
  lastAssignType?: string; //Dynamic value, undefined by default, the name of the assignType
  lastAssignmentRoom?: string; //Dynamic value, undefined by default, the id of the room
  penultimateAssignType?: string; //Dynamic value, undefined by default, the name of the assignType
  isPrincipalLastAssignment?: boolean; //Dynamic value, if this participant is principal for the assignment
  isPrincipalPenultimateAssignment?: boolean; //Dynamic value, if this participant is principal for the assignment
  isAssistantLastAssignment?: boolean; //Dynamic value, if this participant is principal for the assignment
  isAssistantPenultimateAssignment?: boolean; //Dynamic value, if this participant is principal for the assignment
  hasCollision?: boolean; //Dynamic value, if the participant has the same assignment before or after the required no participation time of the assignment
  isCloseToOthers?: boolean; //Dynamic value, if the participant has other assignments before or after the required no close participation of the assignments,
  isCloseToOthersPrayer?: boolean; //Dynamic value, if the participant has other assignments before or after the required no close participation of the assignments
  isCloseToOthersTreasuresEtc?: boolean; //Dynamic value, if the participant has other assignments before or after the required no close participation of the assignments
  isStarvingSchool?: boolean; //Dynamic value, if the participant has the lowest global participation
  isStarvinPrayer?: boolean; //Dynamic value, if the participant has the lowest global participation
  isStarvingTreasuresEtc?: boolean; //Dynamic value, if the participant has the lowest global participation
}

//We need a model to save because on save there are some unwanted properties from the dynamic model
export class ParticipantModel {
  id: string;
  name: string;
  group?: number;
  isWoman: boolean;
  isExternal: boolean;
  rooms: ParticipantRoomInterface[];
  assignTypes: ParticipantAssignTypeInterface[];
  available: boolean;
  notAvailableDates?: Date[];

  constructor(participant: ParticipantInterface) {
    this.id = participant.id;
    this.name = participant.name;
    this.group = participant.group;
    this.isWoman = participant.isWoman;
    this.isExternal = participant.isExternal;
    this.rooms = participant.rooms;
    this.assignTypes = participant.assignTypes;
    this.available = participant.available;
    this.notAvailableDates = participant.notAvailableDates;
  }
}

export interface ParticipantRoomInterface {
  roomId: string;
  available: boolean;
}

export interface ParticipantAssignTypeInterface {
  assignTypeId: string;
  canPrincipal: boolean;
  canAssistant: boolean;
}
