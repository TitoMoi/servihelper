import { LatLngLiteral } from "leaflet";

//The data that we want to associate with a map, this is not the leaflet map, polygon or whatever object from the library

/**
 * The context data from a territory.
 * The lists in this interface means -> First is more new than last [0] is recent than [1] so its a FIFO queue
 */
export interface TerritoryContextInterface {
  id: string;
  name: string;
  poligonId: string;
  image: string; //temporal base64
  imageId: string;
  meetingPointUrl: string; //url
  assignedDates?: Date[]; //When its assigned
  returnedDates?: Date[]; //When its returned
  participants?: string[]; //Participants assigned
  groups: string[]; //The id of the groups where this territory belongs to
  m: Date; //last created or modified date
}

export interface PolygonInterface {
  id: string;
  latLngList: LatLngLiteral[]; //We save the polygon points, then we create in runtime the polygon from leaflet
  m: Date; //last modified date
}

export interface TerritoryGroupInterface {
  id: string;
  name: string;
  color: string;
  order: number;
}
