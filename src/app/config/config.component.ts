import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import AdmZip from "adm-zip";
import { ConfigService } from "app/config/service/config.service";
import { ElectronService } from "app/services/electron.service";
import { APP_CONFIG } from "environments/environment";
import * as fs from "fs-extra";
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

  // If zip is loaded and saved
  isZipLoaded = false;

  // If config assignmentHeader key is saved
  isAssignmentHeaderTitleSaved = false;

  // Confirm the delete operation
  confirmDelete = false;

  // If upload button is clicked
  upload = false;

  // the filesystem api
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

    this.fs = electronService.remote.require("fs-extra");
  }

  ngOnInit() {
    this.configForm = this.formBuilder.group({
      assignmentHeaderTitle: undefined,
    });

    this.configForm
      .get("assignmentHeaderTitle")
      .setValue(this.configService.getConfig().assignmentHeaderTitle);
  }

  downloadFiles() {
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

  getZipContentFromFileEvent(event: Event) {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    return target.files[0];
  }

  uploadZipFiles(event: Event) {
    const zipFile = this.getZipContentFromFileEvent(event);
    const zip = new AdmZip(zipFile.path);
    // reading archives
    zip.getEntries().forEach((zipEntry) => {
      switch (zipEntry.entryName) {
        case "assignment.json":
          this.fs.writeFile(
            this.path + "/assignment.json",
            zipEntry.getData().toString("utf8")
          );
          break;
        case "participant.json":
          this.fs.writeFile(
            this.path + "/participant.json",
            zipEntry.getData().toString("utf8")
          );
          break;
        case "room.json":
          this.fs.writeFile(
            this.path + "/room.json",
            zipEntry.getData().toString("utf8")
          );
          break;
        case "assignType.json":
          this.fs.writeFile(
            this.path + "/assignType.json",
            zipEntry.getData().toString("utf8")
          );
          break;
        case "note.json":
          this.fs.writeFile(
            this.path + "/note.json",
            zipEntry.getData().toString("utf8")
          );
          break;
        case "config.json":
          this.fs.writeFile(
            this.path + "/config.json",
            zipEntry.getData().toString("utf8")
          );
          break;
      }
    });
    this.isZipLoaded = true;
  }

  eraseAllData() {
    //Restart data
    this.fs.writeJsonSync(this.path + "/config.json", {
      lang: "en",
      firstDayOfWeek: 1,
      assignmentHeaderTitle: "",
    });
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
