import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ConfigService } from "app/config/service/config.service";
import { ElectronService } from "app/services/electron.service";
import { APP_CONFIG } from "environments/environment";
import * as fs from "fs-extra";
import { ConfigInterface } from "./model/config.model";
@Component({
  selector: "app-config",
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.scss"],
})
export class ConfigComponent implements OnInit {
  // The path of the app
  path: string;

  // Config form
  configForm;

  // If config assignmentHeader key is saved
  isAssignmentHeaderTitleSaved = false;

  // Confirm the delete operation
  confirmDelete = false;

  //Restart data
  config: ConfigInterface = {
    lang: "en",
    firstDayOfWeek: 1,
    assignmentHeaderTitle: "",
  };

  // the filesystem api
  fs: typeof fs = this.electronService.remote.require("fs-extra");

  constructor(
    private formBuilder: FormBuilder,
    private configService: ConfigService,
    private electronService: ElectronService
  ) {
    this.path = APP_CONFIG.production
      ? //__dirname is where the .json files exists
        __dirname + "./assets/source"
      : "./assets/source";
  }

  ngOnInit() {
    this.configForm = this.formBuilder.group({
      assignmentHeaderTitle: undefined,
    });

    this.configForm
      .get("assignmentHeaderTitle")
      .setValue(this.configService.getConfig().assignmentHeaderTitle);
  }

  /**
   * Resets data to default
   */
  eraseAllData() {
    this.fs.writeJsonSync(this.path + "/config.json", this.config);
    this.fs.writeJsonSync(this.path + "/note.json", []);
    this.fs.writeJsonSync(this.path + "/assignType.json", []);
    this.fs.writeJsonSync(this.path + "/room.json", []);
    this.fs.writeJsonSync(this.path + "/participant.json", []);
    this.fs.writeJsonSync(this.path + "/assignment.json", []);

    //Close the program
    this.electronService.remote.getCurrentWindow().close();
  }

  handleImageHeaderInput(e: Event) {
    const elem: HTMLInputElement = e.target as HTMLInputElement;
    this.configService.updateConfigByKey("assignmentHeaderTitle", elem.value);
  }

  onSubmit(): void {
    const assignmentHeaderTitle = this.configForm.get(
      "assignmentHeaderTitle"
    ).value;
    this.configService.updateConfigByKey(
      "assignmentHeaderTitle",
      assignmentHeaderTitle
    );
    this.isAssignmentHeaderTitleSaved = true;
  }
}
