import { Injectable } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
import { readJSONSync, writeJsonSync } from "fs-extra";
import { MigrationInterface } from "app/migration/model/migration.model";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { RoomService } from "app/room/service/room.service";

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
    const migration: MigrationInterface = readJSONSync(this.configService.migrationPath, {
      throws: false,
    });

    //First migration
    if (!migration) {
      this.toV5();
      this.saveData();
      return;
    }
  }

  saveData() {
    this.assignTypeService.saveAssignTypesToFile();
    this.roomService.saveRoomsToFile();
  }

  /*Based on git changes to the models **/
  toV5() {
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