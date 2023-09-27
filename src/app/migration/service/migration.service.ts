import { Injectable } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
import {
  readJsonSync,
  removeSync,
  writeFileSync,
  writeJSONSync,
  writeJsonSync,
} from "fs-extra";
import { MigrationInterface } from "app/migration/model/migration.model";
import path from "path";
import { gzip } from "pako";

@Injectable({
  providedIn: "root",
})
export class MigrationService {
  //Migrate data based on the model
  constructor(private configService: ConfigService) {}

  migrateData() {
    //First migration
    this.toV5();
  }

  /*Based on git changes to the models **/
  toV5() {
    //:::assignments:::
    //Now assignments are gziped, so we need to convert from json to gzip
    const assignmentJsonPath = path.join(
      this.configService.sourceFilesPath,
      "assignment.json"
    );
    const assignments = readJsonSync(assignmentJsonPath, { throws: false });
    if (assignments) {
      const gziped = gzip(JSON.stringify(assignments), { to: "string" });
      writeFileSync(this.configService.assignmentsPath, gziped);

      //After migrated, remove old assignments.json
      removeSync(assignmentJsonPath);
    }

    //:::Polygons, territories and territory groups are now gzip

    //TERRITORIES
    const territoryJsonPath = path.join(this.configService.sourceFilesPath, "territory.json");
    const territories = readJsonSync(territoryJsonPath, { throws: false });
    if (territories) {
      const gziped = gzip(JSON.stringify(territories), { to: "string" });
      writeFileSync(this.configService.territoriesPath, gziped);

      //After migrated, remove old territory.json
      removeSync(territoryJsonPath);
    }

    //TERRITORY GROUPS
    const territoryGroupJsonPath = path.join(
      this.configService.sourceFilesPath,
      "territoryGroup.json"
    );
    const territoryGroups = readJsonSync(territoryGroupJsonPath, { throws: false });
    if (territoryGroups) {
      const gziped = gzip(JSON.stringify(territoryGroups), { to: "string" });
      writeFileSync(this.configService.territoryGroupsPath, gziped);

      //After migrated, remove old territoryGroup.json
      removeSync(territoryGroupJsonPath);
    }

    //POLYGONS
    const polygonsJsonPath = path.join(this.configService.sourceFilesPath, "polygons.json");
    const polygons = readJsonSync(polygonsJsonPath, { throws: false });
    if (polygons) {
      const gziped = gzip(JSON.stringify(polygons), { to: "string" });
      writeFileSync(this.configService.polygonsPath, gziped);

      //After migrated, remove old polygons.json
      removeSync(polygonsJsonPath);
    }

    //:::assignTypes:::
    const assignTypes = readJsonSync(this.configService.assignTypesPath);
    if (assignTypes) {
      for (const at of assignTypes) {
        //add properties days, tKey, type
        if (at.days == null) {
          at.days = 0;
        }
        if (at.tKey == null) {
          at.tKey = "";
        }
        if (at.type == null) {
          at.type = "other";
        }
        //find isPublicSpeech property, put it in type
        if (at["isPublicSpeech"] != null) {
          at.type = "publicSpeech";
        }
        //delete all isPublicSpeech properties
        delete at["isPublicSpeech"];
      }
      writeJSONSync(this.configService.assignTypesPath, assignTypes);

      //:::rooms:::
      //add property tKey, type
      const rooms = readJsonSync(this.configService.roomsPath);
      for (const room of rooms) {
        if (room.tKey == null) {
          room.tKey = "";
        }
        if (room.type == null) {
          room.type = "other";
        }
      }
      writeJSONSync(this.configService.roomsPath, rooms);

      //create file migration.json
      const migration: MigrationInterface = {
        version: 5,
      };
      writeJsonSync(this.configService.migrationPath, migration);
    }
  }
}
