import { LatLngLiteral } from "leaflet";

//The data that we want to associate with a map, this is not the leaflet map, polygon or whatever object from the library

/**
 * The context data from a territory.
 * The lists in this interface means -> First is more new than last, [0] is recent than [1] so its a FIFO queue
 */
export interface TerritoryContextInterface {
  id: string;
  name: string;
  available: boolean; //Is this territory available to assign
  poligonId: string;
  imageId: string;
  meetingPointUrl: string; //url
  assignedDates?: Date[]; //When its assigned
  returnedDates?: Date[]; //When its returned
  participants?: string[]; //Participants assigned
  groups: string[]; //The id of the groups where this territory belongs to
  m: Date; //last created or modified date
}
/**
 * The need for class instead of merely the interface is because when adding new properties we need
 * to ensure retro compatibility, this way we can assign an optional value to the new properties
 * for backward data.
 * Also, there is no need to define the logic on the form group for each property because its defined here
 * and its possible to return an empty shell
 */
export class TerritoryContextClass implements TerritoryContextInterface {
  id: string;
  name: string;
  available: boolean;
  poligonId: string;
  imageId: string;
  meetingPointUrl: string;
  assignedDates: Date[];
  returnedDates: Date[];
  participants: string[]; // Participants id's
  groups: string[];
  m: Date;

  // eslint-disable-next-line complexity
  constructor(territoryContext?: TerritoryContextInterface) {
    if (territoryContext) {
      this.id = territoryContext.id;
      this.name = territoryContext.name;
      this.available = territoryContext.available ?? true;
      this.poligonId = territoryContext.poligonId;
      this.imageId = territoryContext.imageId;
      this.meetingPointUrl = territoryContext.meetingPointUrl;
      this.assignedDates = territoryContext.assignedDates ?? [];
      this.returnedDates = territoryContext.returnedDates ?? [];
      this.participants = territoryContext.participants ?? [];
      this.groups = territoryContext.groups ?? [];
      this.m = territoryContext.m;
    } else {
      this.available = true;
      this.assignedDates = [];
      this.returnedDates = [];
      this.participants = [];
      this.groups = [];
    }
  }
}

export interface PolygonInterface {
  id: string;
  latLngList: LatLngLiteral[]; //We save the polygon points, then we create in runtime the polygon from leaflet
  m: Date; //last modified date
}

export class PolygonClass implements PolygonInterface {
  id: string;
  latLngList: LatLngLiteral[];
  m: Date;
  constructor(polygon?: PolygonInterface) {
    if (polygon) {
      this.id = polygon.id;
      this.latLngList = polygon.latLngList ?? [];
      this.m = polygon.m;
    } else {
      this.latLngList = [];
    }
  }
}

export interface TerritoryGroupInterface {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface S13TerritoryEntry {
  terr_number: string;
  last_completed_date: string;
  participant1: string;
  participant2: string;
  participant3: string;
  participant4: string;
  assigned1: string;
  returned1: string;
  assigned2: string;
  returned2: string;
  assigned3: string;
  returned3: string;
  assigned4: string;
  returned4: string;
}
