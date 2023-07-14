import { Injectable, inject } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
import { PolygonInterface } from "../model/map.model";
import { readJSONSync, writeJson } from "fs-extra";
import { nanoid } from "nanoid/non-secure";

@Injectable({
  providedIn: "root",
})
export class PolygonService {
  private configService = inject(ConfigService);

  //flag to indicate that polygons file has changed
  hasChanged = true;
  //The array of polygons in memory
  #polygons: PolygonInterface[];
  //The map of polygons for look up of polygons
  #polygonsMap: Map<string, PolygonInterface> = new Map();
  /**
   *
   * @returns PolygonInterface[] the array of polygons
   */
  getPolygons(deepClone = false) {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#polygons) : this.#polygons;
    }
    this.hasChanged = false;
    this.#polygons = readJSONSync(this.configService.polygonsPath);
    for (const polygon of this.#polygons) {
      this.#polygonsMap.set(polygon.id, polygon);
    }
    return deepClone ? structuredClone(this.#polygons) : this.#polygons;
  }
  /**
   *
   * @returns true if polygons are saved to disk or false
   */
  #savePolygonsToFile(): boolean {
    //Write polygons back to file
    writeJson(this.configService.polygonsPath, this.#polygons);
    return true;
  }

  /**
   *
   * @param polygon the polygon to create
   * @returns the id of the new polygon
   */
  createPolygon(polygon: PolygonInterface): string {
    //Generate id for the polygon
    polygon.id = nanoid(this.configService.nanoMaxCharId);
    polygon.m = new Date();
    //add polygon to polygons
    this.#polygons.push(polygon);
    this.#polygonsMap.set(polygon.id, polygon);
    //save polygons with the new polygon
    this.#savePolygonsToFile();

    return polygon.id;
  }

  /**
   *
   * @param id the id of the polygon to search for
   * @returns the polygon that is ALWAYS found
   */
  getPolygon(id: string | undefined) {
    //search polygon
    return this.#polygonsMap.get(id)!;
  }

  /**
   *
   * @param polygon the polygon to update
   * @returns true if polygon is updated and saved false otherwise
   */
  updatePolygon(polygon: PolygonInterface): boolean {
    //update polygon
    for (let i = 0; i < this.#polygons.length; i++) {
      if (this.#polygons[i].id === polygon.id) {
        polygon.m = new Date();
        this.#polygons[i] = polygon;
        this.#polygonsMap.set(polygon.id, polygon);
        //save polygons with the updated polygon
        return this.#savePolygonsToFile();
      }
    }
    return false;
  }

  /**
   *
   * @param polygon the polygon to delete
   * @returns true if polygon is deleted and saved false otherwise
   */
  deletePolygon(id: string): boolean {
    //delete polygon
    this.#polygonsMap.delete(id);
    this.#polygons = this.#polygons.filter((b) => b.id !== id);
    //save polygons
    return this.#savePolygonsToFile();
  }
}
