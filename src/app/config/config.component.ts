import { ConfigService } from "app/config/service/config.service";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { writeJsonSync } from "fs-extra";
import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from "@angular/core";
import { UntypedFormBuilder, ReactiveFormsModule } from "@angular/forms";
import { TranslocoService, TranslocoModule } from "@ngneat/transloco";
import { DateFormatStyles } from "@ngneat/transloco-locale";

import { ConfigInterface, WeekDaysBegin } from "./model/config.model";
import { ipcRenderer } from "electron";
import { MatButtonModule } from "@angular/material/button";
import { NgFor, NgIf } from "@angular/common";
import { MatOptionModule } from "@angular/material/core";
import { MatSelect, MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { SheetTitleService } from "app/sheet-title/service/sheet-title.service";
import { SheetTitlePipe } from "app/sheet-title/pipe/sheet-title.pipe";

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
    RouterLink,
    RouterLinkActive,
    NgFor,
    MatButtonModule,
    NgIf,
    MatIconModule,
    SheetTitlePipe,
  ],
})
export class ConfigComponent implements OnDestroy {
  @ViewChild("titleSelect") titleSelect: MatSelect;
  translocoDateFormats: DateFormatStyles[] = ["short", "medium", "long", "full"];

  titles = this.sheetTitleService.getTitles().sort((a, b) => (a.order > b.order ? 1 : -1));

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
  form = this.formBuilder.group({
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
    lastMapClick: { lat: 41.254340619843205, lng: -74.35855865478517 }, //warwick
    roles: [],
    role: this.configService.administratorKey,
  };

  notes: NoteInterface[] = this.noteService.getNotes();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private configService: ConfigService,
    private noteService: NoteService,
    private sheetTitleService: SheetTitleService,
    private translocoService: TranslocoService
  ) {}

  ngOnDestroy(): void {
    this.configService.updateConfig({
      ...this.defaultConfig, //Default config
      ...this.configService.getConfig(), //Current config
      ...this.form.value, //Incoming config
    });
  }

  /**
   * Resets data to default
   */
  eraseAllData() {
    writeJsonSync(this.configService.configPath, this.defaultConfig);
    writeJsonSync(this.configService.notesPath, []);
    writeJsonSync(this.configService.assignmentsPath, []);
    writeJsonSync(this.configService.roomsPath, []);
    writeJsonSync(this.configService.participantsPath, []);
    writeJsonSync(this.configService.assignTypesPath, []);
    writeJsonSync(this.configService.territoriesPath, []);
    writeJsonSync(this.configService.territoryGroupsPath, []);
    writeJsonSync(this.configService.polygonsPath, []);

    //Close the program
    ipcRenderer.send("closeApp");
  }

  handleImageHeaderInput(e: Event) {
    const elem: HTMLInputElement = e.target as HTMLInputElement;
    this.configService.updateConfigByKey("assignmentHeaderTitle", elem.value);
  }

  stopPropagation(event) {
    event.stopPropagation();
  }
}
