import { Injectable, inject } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
import { PolygonClass, PolygonInterface } from "../../model/map.model";
import { readFileSync, writeFile } from "fs-extra";
import { nanoid } from "nanoid/non-secure";
import { inflate, deflate } from "pako";
@Injectable({
  providedIn: "root",
})
export class PolygonService {
  private configService = inject(ConfigService);

  //flag to indicate that polygons file has changed
  hasChanged = true;
  //The array of polygons in memory
  #polygons: PolygonClass[];
  //The map of polygons for look up of polygons
  #polygonsMap: Map<string, PolygonInterface> = new Map();
  /**
   *
   * @returns PolygonInterface[] the array of polygons
   */
  // eslint-disable-next-line complexity
  getPolygons(deepClone = false) {
    if (!this.hasChanged) {
      return deepClone ? structuredClone(this.#polygons) : this.#polygons;
    }
    this.hasChanged = false;

    const polygonsContent = readFileSync(this.configService.polygonsPath);

    if (polygonsContent) {
      this.#polygons = (
        JSON.parse(inflate(polygonsContent, { to: "string" })) as PolygonInterface[]
      ).map((p) => new PolygonClass(p));

      for (const polygon of this.#polygons) {
        this.#polygonsMap.set(polygon.id, polygon);
      }
    }
    return deepClone ? structuredClone(this.#polygons) : this.#polygons;
  }
  /**
   *
   * @returns true if polygons are saved to disk or false
   */
  #savePolygonsToFile(): boolean {
    //Write territories back to file
    const gziped = deflate(JSON.stringify(this.#polygons), { to: "string" });
    writeFile(this.configService.polygonsPath, gziped);
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
  getPolygon(id: string): PolygonClass {
    const p = this.#polygonsMap.get(id);
    return p ? p : new PolygonClass();
  }

  /**
   *
   * @param polygon the polygon to update
   * @returns true if polygon is updated and saved false otherwise
   */
  updatePolygon(polygon: PolygonClass): boolean {
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
