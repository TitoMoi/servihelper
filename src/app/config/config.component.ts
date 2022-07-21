import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { TranslocoService } from "@ngneat/transloco";
import { DateFormatStyles } from "@ngneat/transloco-locale";
import { ConfigService } from "app/config/service/config.service";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { ElectronService } from "app/services/electron.service";
import { APP_CONFIG } from "environments/environment";
import * as fs from "fs-extra";
import { ConfigInterface, WeekDaysBegin } from "./model/config.model";
@Component({
  selector: "app-config",
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigComponent {
  // The path of the app
  path: string;

  version = this.configService.getConfig().appVersion;

  translocoDateFormats: DateFormatStyles[] = [
    "short",
    "medium",
    "long",
    "full",
  ];

  weekDayBegins: WeekDaysBegin[] = [
    {
      name: this.translocoService.translate("CONFIG_DATE_SUNDAY"),
      value: 0, //Sunday
    },
    {
      name: this.translocoService.translate("CONFIG_DATE_MONDAY"),
      value: 1, //Monday
    },
  ];

  //is part of the form
  defaultReportDateColor: string =
    this.configService.getConfig().defaultReportDateColor;

  // Config form
  configForm = this.formBuilder.group({
    defaultFooterNoteId: this.configService.getConfig().defaultFooterNoteId,
    defaultReportFontSize: this.configService.getConfig().defaultReportFontSize,
    defaultReportDateFormat:
      this.configService.getConfig().defaultReportDateFormat,
    defaultWeekDayBegins: this.configService.getConfig().defaultWeekDayBegins,
    assignmentHeaderTitle: this.configService.getConfig().assignmentHeaderTitle,
    assignmentPrincipalTitle:
      this.configService.getConfig().assignmentPrincipalTitle,
    assignmentAssistantTitle:
      this.configService.getConfig().assignmentAssistantTitle,
    assignmentDateTitle: this.configService.getConfig().assignmentDateTitle,
    assignmentAssignTypeTitle:
      this.configService.getConfig().assignmentAssignTypeTitle,
    assignmentThemeTitle: this.configService.getConfig().assignmentThemeTitle,
    assignmentRoomTitle: this.configService.getConfig().assignmentRoomTitle,
    assignmentNoteTitle: this.configService.getConfig().assignmentNoteTitle,
  });

  // If config assignmentHeader key is saved
  isFormSaved = false;

  // Confirm the delete operation
  confirmDelete = false;

  //Restart data
  config: ConfigInterface = {
    appVersion: "3.0.0",
    lang: "en",
    assignmentHeaderTitle: "",
    assignmentPrincipalTitle: "",
    assignmentAssistantTitle: "",
    assignmentDateTitle: "",
    assignmentAssignTypeTitle: "",
    assignmentThemeTitle: "",
    assignmentRoomTitle: "",
    assignmentNoteTitle: "",
    defaultFooterNoteId: "",
    defaultReportFontSize: "",
    defaultReportDateColor: "",
    defaultWeekDayBegins: 1,
    defaultReportDateFormat: this.translocoDateFormats[0],
  };

  notes: NoteInterface[] = this.noteService.getNotes();

  // the filesystem api
  fs: typeof fs = this.electronService.remote.require("fs-extra");

  constructor(
    private formBuilder: FormBuilder,
    private configService: ConfigService,
    private noteService: NoteService,
    private translocoService: TranslocoService,
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
    this.configService.updateConfig({
      ...this.config, //Default config
      ...this.configService.getConfig(), //Current config
      ...this.configForm.value, //Incoming config
      defaultReportDateColor: this.defaultReportDateColor,
    });

    this.isFormSaved = true;
  }
}
