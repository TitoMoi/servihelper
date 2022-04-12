import { Component, OnInit } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
import { ConfigInterface } from "./model/config.model";
import { FormBuilder } from "@angular/forms";
import AdmZip from "adm-zip";
import { APP_CONFIG } from "environments/environment";
import { ElectronService } from "app/services/electron.service";
import * as fs from "fs-extra";
@Component({
  selector: "app-config",
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.scss"],
})
export class ConfigComponent implements OnInit {
  //The path of the app
  path: string;

  //Config form
  configForm;

  //in memory config
  config: ConfigInterface;

  //If is config loaded
  isConfigLoaded;
  isAssignmentHeaderTitleSaved;

  isParticipantSaved;
  isAssignmentSaved;
  isNoteSaved;
  isAssignTypeSaved;
  isRoomSaved;
  isConfigSaved;
  upload;
  confirmDelete;

  fs: typeof fs;

  constructor(
    private formBuilder: FormBuilder,
    private configService: ConfigService,
    private electronService: ElectronService
  ) {
    this.path = APP_CONFIG.production
      ? //__dirname is where the .json files exists
        __dirname + "./assets/source"
      : "./assets/source";

    this.isAssignmentHeaderTitleSaved = false;
    this.isParticipantSaved = false;
    this.isAssignmentSaved = false;
    this.isNoteSaved = false;
    this.isAssignTypeSaved = false;
    this.isRoomSaved = false;
    this.isConfigSaved = false;
    this.upload = false;
    this.confirmDelete = false;

    this.fs = electronService.remote.require("fs-extra");
  }

  async ngOnInit(): Promise<void> {
    this.configForm = this.formBuilder.group({
      assignmentHeaderTitle: undefined,
    });

    await this.getConfig();
  }

  async getConfig() {
    this.config = await this.configService.getConfig();

    const assignmentHeaderControl = this.configForm.get(
      "assignmentHeaderTitle"
    );
    assignmentHeaderControl.setValue(this.config.assignmentHeaderTitle);

    this.isConfigLoaded = true;
  }

  async downloadFiles() {
    const zip = new AdmZip();

    zip.addLocalFolder(this.path);

    zip.toBuffer((buffer: Buffer) => {
      const blob = new Blob([buffer], { type: "application/octet" });
      const zipLink = document.createElement("a");
      zipLink.href = window.URL.createObjectURL(blob);
      zipLink.setAttribute("download", "servihelper-files.zip");
      zipLink.click();
    });
  }

  async getContentFromFileEvent(event: Event): Promise<string> {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    const file = target.files[0];
    const content = await file.text();
    return JSON.parse(content);
  }

  async uploadParticipantFile(event: Event) {
    const content = await this.getContentFromFileEvent(event);
    this.fs.writeJSON(this.path + "/participant.json", content);
    this.isParticipantSaved = true;
  }

  async uploadAssignmentFile(event: Event) {
    const content = await this.getContentFromFileEvent(event);
    this.fs.writeJSON(this.path + "/assignment.json", content);
    this.isAssignmentSaved = true;
  }

  async uploadRoomFile(event: Event) {
    const content = await this.getContentFromFileEvent(event);
    this.fs.writeJSON(this.path + "/room.json", content);
    this.isRoomSaved = true;
  }

  async uploadAssignTypeFile(event: Event) {
    const content = await this.getContentFromFileEvent(event);
    this.fs.writeJSON(this.path + "/assignType.json", content);
    this.isAssignTypeSaved = true;
  }

  async uploadNoteFile(event: Event) {
    const content = await this.getContentFromFileEvent(event);
    this.fs.writeJSON(this.path + "/note.json", content);
    this.isNoteSaved = true;
  }

  async uploadConfigFile(event: Event) {
    const content = await this.getContentFromFileEvent(event);
    this.fs.writeJSON(this.path + "/config.json", content);
    this.isConfigSaved = true;
  }

  async eraseAllData() {
    //ITS DELETE
    this.fs.remove(this.path);

    //Close the program
    this.electronService.remote.getCurrentWindow().close();
  }

  async handleImageHeaderInput(e: Event) {
    const elem: HTMLInputElement = e.target as HTMLInputElement;
    const config: ConfigInterface = await this.configService.getConfig();
    config.assignmentHeaderTitle = elem.value;
    this.configService.updateConfig(config);
  }

  async onSubmit(config: ConfigInterface): Promise<void> {
    this.config.assignmentHeaderTitle = config.assignmentHeaderTitle;
    await this.configService.updateConfig(this.config);
    this.isAssignmentHeaderTitleSaved = true;
  }
}
