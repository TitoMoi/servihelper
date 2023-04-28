import { ConfigService } from "app/config/service/config.service";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { APP_CONFIG } from "environments/environment";
import { writeJsonSync } from "fs-extra";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { UntypedFormBuilder, ReactiveFormsModule } from "@angular/forms";
import { TranslocoService, TranslocoModule } from "@ngneat/transloco";
import { DateFormatStyles } from "@ngneat/transloco-locale";

import { ConfigInterface, WeekDaysBegin } from "./model/config.model";
import { ipcRenderer } from "electron";
import { SharedService } from "app/services/shared.service";
import { MatButtonModule } from "@angular/material/button";
import { NgFor, NgIf } from "@angular/common";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatExpansionModule } from "@angular/material/expansion";

@Component({
  selector: "app-config",
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    MatButtonModule,
    NgIf,
  ],
})
export class ConfigComponent {
  // The path of the app
  path: string = APP_CONFIG.production
    ? //__dirname is where the .json files exists
      __dirname + "/assets/source"
    : "./assets/source";

  appVersion = this.sharedService.appVersion;

  translocoDateFormats: DateFormatStyles[] = ["short", "medium", "long", "full"];

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
  currentConfig = this.configService.getConfig();

  // Config form
  configForm = this.formBuilder.group({
    defaultFooterNoteId: this.currentConfig.defaultFooterNoteId,
    defaultReportFontSize: this.currentConfig.defaultReportFontSize,
    defaultReportDateFormat: this.currentConfig.defaultReportDateFormat,
    defaultReportDateColor: this.currentConfig.defaultReportDateColor,
    defaultWeekDayBegins: this.currentConfig.defaultWeekDayBegins,
    assignmentHeaderTitle: this.currentConfig.assignmentHeaderTitle,
    assignmentPrincipalTitle: this.currentConfig.assignmentPrincipalTitle,
    assignmentAssistantTitle: this.currentConfig.assignmentAssistantTitle,
    assignmentDateTitle: this.currentConfig.assignmentDateTitle,
    assignmentAssignTypeTitle: this.currentConfig.assignmentAssignTypeTitle,
    assignmentThemeTitle: this.currentConfig.assignmentThemeTitle,
    assignmentRoomTitle: this.currentConfig.assignmentRoomTitle,
    assignmentNoteTitle: this.currentConfig.assignmentNoteTitle,
    reportTitle: this.currentConfig.reportTitle,
  });

  // If config assignmentHeader key is saved
  isFormSaved = false;

  // Confirm the delete operation
  confirmDelete = false;

  //Restart data
  defaultConfig: ConfigInterface = {
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
    defaultReportDateColor: "#FFFFFF",
    defaultWeekDayBegins: 1,
    defaultReportDateFormat: this.translocoDateFormats[3],
    roles: [],
    role: this.configService.administratorKey,
  };

  notes: NoteInterface[] = this.noteService.getNotes();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private configService: ConfigService,
    private noteService: NoteService,
    private translocoService: TranslocoService,
    private sharedService: SharedService
  ) {}

  /**
   * Resets data to default
   */
  eraseAllData() {
    writeJsonSync(this.path + "/config.json", this.defaultConfig);
    writeJsonSync(this.path + "/note.json", []);
    writeJsonSync(this.path + "/assignType.json", []);
    writeJsonSync(this.path + "/room.json", []);
    writeJsonSync(this.path + "/participant.json", []);
    writeJsonSync(this.path + "/assignment.json", []);

    //Close the program
    ipcRenderer.send("closeApp");
  }

  handleImageHeaderInput(e: Event) {
    const elem: HTMLInputElement = e.target as HTMLInputElement;
    this.configService.updateConfigByKey("assignmentHeaderTitle", elem.value);
  }

  onSubmit(): void {
    this.configService.updateConfig({
      ...this.defaultConfig, //Default config
      ...this.configService.getConfig(), //Current config
      ...this.configForm.value, //Incoming config
    });

    this.isFormSaved = true;
  }
}
