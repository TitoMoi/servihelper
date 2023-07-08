import { LatLngTuple } from "leaflet";

export interface MapInterface {
  id: string;
  name: string;
  poligonId: string;
  initDateList: Date[]; //First is more new than last [0] is recent than [1] so its a FIFO queue
  endDateList: Date[]; //First is more new than last [0] is recent than [1] so its a FIFO queue
  assignedToList: string[]; //First is more new than last [0] is recent than [1] so its a FIFO queue
  m: Date; //last modified date
}

export interface PolygonInterface {
  id: string;
  latLngTupleList: LatLngTuple[]; //We save the polygon points, then we create in runtime the polygon from leaflet
  m: Date; //last modified date
}
