import { Injectable } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
import { readJsonSync, removeSync, writeFileSync, writeJsonSync } from "fs-extra";
import { MigrationInterface } from "app/migration/model/migration.model";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { RoomService } from "app/room/service/room.service";
import path from "path";
import { gzip } from "pako";

@Injectable({
  providedIn: "root",
})
export class MigrationService {
  //Migrate data based on the model
  constructor(
    private configService: ConfigService,
    private assignTypeService: AssignTypeService,
    private roomService: RoomService
  ) {}

  migrateData() {
    //First migration
    this.toV5();
    this.saveData();
    return;
  }

  saveData() {
    //save them sync or the migration process breaks
    this.assignTypeService.saveAssignTypesToFile(true);
    this.roomService.saveRoomsToFile(true);
  }

  /*Based on git changes to the models **/
  toV5() {
    //:::assignments:::
    //Now assignments are gziped, so we need to convert from json to gzip
    const assignmentJsonPath = path.join(
      this.configService.sourceFilesPath,
      "assignment.json"
    );
    const assignments = readJsonSync(assignmentJsonPath);
    if (assignments) {
      const gziped = gzip(JSON.stringify(assignments), { to: "string" });
      writeFileSync(this.configService.assignmentsPath, gziped);

      //After migrated, remove old assignments.json
      removeSync(assignmentJsonPath);
    }

    //:::Polygons, territories and territory groups are now gzip

    const territoryJsonPath = path.join(this.configService.sourceFilesPath, "territory.json");
    const territories = readJsonSync(territoryJsonPath);
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
    const territoryGroups = readJsonSync(territoryGroupJsonPath);
    if (territoryGroups) {
      const gziped = gzip(JSON.stringify(territoryGroups), { to: "string" });
      writeFileSync(this.configService.territoryGroupsPath, gziped);

      //After migrated, remove old territoryGroup.json
      removeSync(territoryGroupJsonPath);
    }

    //POLYGONS
    const polygonsJsonPath = path.join(this.configService.sourceFilesPath, "polygons.json");
    const polygons = readJsonSync(polygonsJsonPath);
    if (polygons) {
      const gziped = gzip(JSON.stringify(polygons), { to: "string" });
      writeFileSync(this.configService.polygonsPath, gziped);

      //After migrated, remove old polygons.json
      removeSync(polygonsJsonPath);
    }

    //:::assignTypes:::
    for (const at of this.assignTypeService.getAssignTypes()) {
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

    //:::rooms:::
    //add property tKey, type
    for (const room of this.roomService.getRooms()) {
      if (room.tKey == null) {
        room.tKey = "";
      }
      if (room.type == null) {
        room.type = "other";
      }
    }

    //create file migration.json
    const migration: MigrationInterface = {
      version: 5,
    };
    this.saveMigration(migration);
  }

  saveMigration(migration: MigrationInterface) {
    writeJsonSync(this.configService.migrationPath, migration);
  }
}
