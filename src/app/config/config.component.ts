import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { DateFormatStyles } from "@ngneat/transloco-locale";
import { ConfigService } from "app/config/service/config.service";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { ElectronService } from "app/services/electron.service";
import { APP_CONFIG } from "environments/environment";
import * as fs from "fs-extra";
import { ConfigInterface } from "./model/config.model";
@Component({
  selector: "app-config",
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.scss"],
})
export class ConfigComponent {
  // The path of the app
  path: string;

  // Config form
  configForm = this.formBuilder.group({
    assignmentHeaderTitle: this.configService.getConfig().assignmentHeaderTitle,
    defaultFooterNoteId: this.configService.getConfig().defaultFooterNoteId,
  });

  // If config assignmentHeader key is saved
  isFormSaved = false;

  // Confirm the delete operation
  confirmDelete = false;

  translocoDateFormatStyle: DateFormatStyles = "short";

  //Restart data
  config: ConfigInterface = {
    lang: "en",
    firstDayOfWeek: 1,
    assignmentHeaderTitle: "",
    defaultFooterNoteId: undefined,
    defaultReportFontSize: undefined,
    defaultReportDateColor: undefined,
    defaultReportDateFormat: this.translocoDateFormatStyle,
  };

  notes: NoteInterface[] = this.noteService.getNotes();

  // the filesystem api
  fs: typeof fs = this.electronService.remote.require("fs-extra");

  constructor(
    private formBuilder: FormBuilder,
    private configService: ConfigService,
    private noteService: NoteService,
    private dateFormatStyles: DateFormatStyles,
    private electronService: ElectronService
  ) {
    this.path = APP_CONFIG.production
      ? //__dirname is where the .json files exists
        __dirname + "./assets/source"
      : "./assets/source";
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
    this.configService.updateConfigByKey(
      "assignmentHeaderTitle",
      this.configForm.get("assignmentHeaderTitle").value
    );

    this.configService.updateConfigByKey(
      "defaultFooterNoteId",
      this.configForm.get("defaultFooterNoteId").value
    );

    this.isFormSaved = true;
  }
}
