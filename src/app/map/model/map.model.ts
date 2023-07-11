import { LatLngLiteral } from "leaflet";

//The data that we want to associate with a map, this is not the leaflet map
export interface MapContextInterface {
  id?: string;
  name?: string;
  poligonId?: string;
  initDateList?: Date[]; //First is more new than last [0] is recent than [1] so its a FIFO queue
  endDateList?: Date[]; //First is more new than last [0] is recent than [1] so its a FIFO queue
  assignedToList?: string[]; //First is more new than last [0] is recent than [1] so its a FIFO queue
  m?: Date; //last modified date
}

export interface PolygonInterface {
  id?: string;
  latLngList?: LatLngLiteral[]; //We save the polygon points, then we create in runtime the polygon from leaflet
  m?: Date; //last modified date
}
