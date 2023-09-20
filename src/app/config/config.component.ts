import { ConfigService } from "app/config/service/config.service";
import { NoteInterface } from "app/note/model/note.model";
import { NoteService } from "app/note/service/note.service";
import { readdirSync, writeJsonSync } from "fs-extra";
import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from "@angular/core";
import { UntypedFormBuilder, ReactiveFormsModule } from "@angular/forms";
import { TranslocoService, TranslocoModule } from "@ngneat/transloco";
import { DateFormatStyles } from "@ngneat/transloco-locale";

import { ConfigInterface, WeekDaysBegin } from "./model/config.model";
import { MatButtonModule } from "@angular/material/button";
import { AsyncPipe, NgClass, NgFor, NgIf } from "@angular/common";
import { MatOptionModule } from "@angular/material/core";
import { MatSelect, MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { SheetTitleService } from "app/sheet-title/service/sheet-title.service";
import { SheetTitlePipe } from "app/sheet-title/pipe/sheet-title.pipe";
import { PublicThemePipe } from "app/public-theme/pipe/public-theme.pipe";
import { PublicThemeService } from "app/public-theme/service/public-theme.service";
import path from "path";
import { ipcRenderer } from "electron";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

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
    AsyncPipe,
    NgClass,
    MatIconModule,
    SheetTitlePipe,
    PublicThemePipe,
    MatTooltipModule,
    MatSlideToggleModule,
  ],
})
export class ConfigComponent implements OnDestroy {
  @ViewChild("titleSelect") titleSelect: MatSelect;
  translocoDateFormats: DateFormatStyles[] = ["short", "medium", "long", "full"];

  titles = this.sheetTitleService.getTitles().sort((a, b) => (a.order > b.order ? 1 : -1));

  publicThemes = this.publicThemeService
    .getPublicThemes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

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

  isSharedFolderSelected = false;

  // Config form
  form = this.formBuilder.group({
    closeToOthersDays: this.currentConfig.closeToOthersDays,
    closeToOthersPrayerDays: this.currentConfig.closeToOthersPrayerDays,
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
    defaultReportFontSize: "13",
    defaultReportDateColor: "#FFFFFF",
    defaultWeekDayBegins: 1,
    defaultReportDateFormat: this.translocoDateFormats[3],
    lastMapClick: { lat: 41.254340619843205, lng: -74.35855865478517 }, //warwick
    roles: [],
    role: this.configService.administratorKey,
    lastImportedDate: undefined,
    lastImportedFilename: "",
    closeToOthersDays: 30,
    closeToOthersPrayerDays: 30,
  };

  notes: NoteInterface[] = this.noteService.getNotes();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private configService: ConfigService,
    private noteService: NoteService,
    private sheetTitleService: SheetTitleService,
    private publicThemeService: PublicThemeService,
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
    for (let file of readdirSync(this.configService.sourceFilesPath)) {
      writeJsonSync(path.join(this.configService.sourceFilesPath, file), []);
    }
    //Override with default config
    writeJsonSync(this.configService.configPath, this.defaultConfig);

    //Close the program
    ipcRenderer.send("closeApp");
  }

  async sharedFolderSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    console.log(target.files[0].webkitRelativePath);
    /*  const dialogPath = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    console.log(dialogPath); */

    /* const zipFile = this.getZipContentFromFileEvent(event);
    const zip = new AdmZip(zipFile.path);
    // reading archives
    zip.getEntries().forEach((zipEntry) => {
      switch (
        zipEntry.entryName //entryName = participant.json...etc
      ) {
        case this.configService.configFilename:
          const currentConfig = this.configService.getConfig(); //Default config
          const incomingConfig = JSON.parse(zipEntry.getData().toString("utf8"));
          let finalConfig = { ...currentConfig, ...incomingConfig };
          writeJsonSync(this.configService.configPath, finalConfig);
          break;
        default:
          writeFileSync(
            path.join(this.configService.sourceFilesPath, zipEntry.entryName),
            zipEntry.getData().toString("utf8")
          );
      }
    });

    //After data has been owerwritten, we need to check if we need to migrate and make changes
    this.migrationService.migrateData();

    this.configService.hasChanged = true;
    const config = this.configService.getConfig();
    //Update last imported date and filename
    config.lastImportedDate = new Date();
    config.lastImportedFilename = zipFile.name;
    this.configService.updateConfig(config);

    this.roomService.hasChanged = true;
    this.assignTypeService.hasChanged = true;
    this.assignmentService.hasChanged = true;
    this.participantService.hasChanged = true;
    this.sheetTitleService.hasChanged = true;
    this.publicThemeService.hasChanged = true;
    this.noteService.hasChanged = true;
    this.polygonService.hasChanged = true;
    this.territoryService.hasChanged = true;
    this.territoryGroupService.hasChanged = true;
    this.roomService.getRooms();
    this.assignTypeService.getAssignTypes();
    this.noteService.getNotes();
    this.sheetTitleService.getTitles();
    this.publicThemeService.getPublicThemes();
    this.participantService.getParticipants();
    this.assignmentService.getAssignments();
    this.polygonService.getPolygons();
    this.territoryService.getTerritories();
    this.territoryGroupService.getTerritoryGroups();

    let lang = this.configService.getConfig().lang;
    this.translocoService = this.translocoService.setActiveLang(lang);
    if (lang === "zhCN") lang = "zh";
    this.dateAdapter.setLocale(lang);

    this.isZipLoaded = true; */
  }

  stopPropagation(event) {
    event.stopPropagation();
  }
}
