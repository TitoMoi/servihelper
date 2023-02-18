export interface ParticipantInterface {
  id?: string; //On update id is not coming from the form
  name: string;
  isWoman: boolean;
  isExternal: boolean;
  rooms: ParticipantRoomInterface[];
  assignTypes: ParticipantAssignTypeInterface[];
  available: boolean;
  notAvailableDates?: Date[];
}

//These values are calculated under assignments and statistics pages but shouldnt be saved on json file
export interface ParticipantDynamicInterface extends ParticipantInterface {
  count?: number; //Dynamic value, undefined by default
  hasWork?: boolean; //Dynamic, if has current assignments for the date
  lastAssignmentDate?: Date; //Dynamic value, undefined by default, date of last assignment
  penultimateAssignmentDate?: Date; //Dynamic value, undefined by default, date of penultimate assignment
  distanceBetweenPenultimaAndLast?: string; //Dynamic value, undefined by default, string in distance
  lastAssignType?: string; //Dynamic value, undefined by default, the name of the assignType
  penultimateAssignType?: string; //Dynamic value, undefined by default, the name of the assignType
}

export class ParticipantModel {
  id: string;
  name: string;
  isWoman: boolean;
  isExternal: boolean;
  rooms: ParticipantRoomInterface[];
  assignTypes: ParticipantAssignTypeInterface[];
  available: boolean;
  notAvailableDates?: Date[];

  constructor(participant: ParticipantInterface) {
    this.id = participant.id;
    this.name = participant.name;
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
