import { ConfigService } from "app/config/service/config.service";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { ElectronService } from "app/services/electron.service";
import { APP_CONFIG } from "environments/environment";
import * as fs from "fs-extra";

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { TranslocoService } from "@ngneat/transloco";
import { DateFormatStyles } from "@ngneat/transloco-locale";

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

  version = "3.7.0";

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
    reportTitle: this.configService.getConfig().reportTitle,
  });

  // If config assignmentHeader key is saved
  isFormSaved = false;

  // Confirm the delete operation
  confirmDelete = false;

  //Restart data
  config: ConfigInterface = {
    lang: "en",
    assignmentHeaderTitle: "",
    assignmentPrincipalTitle: "",
    assignmentAssistantTitle: "",
    assignmentDateTitle: "",
    assignmentAssignTypeTitle: "",
    assignmentThemeTitle: "",
    assignmentRoomTitle: "",
    assignmentNoteTitle: "",
    reportTitle: "",
    defaultFooterNoteId: "",
    defaultReportFontSize: "",
    defaultReportDateColor: "",
    defaultWeekDayBegins: 1,
    defaultReportDateFormat: this.translocoDateFormats[3],
  };

  notes: NoteInterface[] = this.noteService.getNotes();

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
    fs.writeJsonSync(this.path + "/config.json", this.config);
    fs.writeJsonSync(this.path + "/note.json", []);
    fs.writeJsonSync(this.path + "/assignType.json", []);
    fs.writeJsonSync(this.path + "/room.json", []);
    fs.writeJsonSync(this.path + "/participant.json", []);
    fs.writeJsonSync(this.path + "/assignment.json", []);

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
