import { ConfigService } from 'app/config/service/config.service';
import { NoteInterface } from 'app/note/model/note.model';
import { NoteService } from 'app/note/service/note.service';
import { copySync, existsSync, readdir, removeSync } from 'fs-extra';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoService, TranslocoModule } from '@ngneat/transloco';
import { DateFormatStyles } from '@ngneat/transloco-locale';

import { ConfigInterface, WeekDaysBegin } from './model/config.model';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SheetTitleService } from 'app/sheet-title/service/sheet-title.service';
import { SheetTitlePipe } from 'app/sheet-title/pipe/sheet-title.pipe';
import { PublicThemePipe } from 'app/public-theme/pipe/public-theme.pipe';
import { PublicThemeService } from 'app/public-theme/service/public-theme.service';
import path from 'path';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { OnlineService } from 'app/online/service/online.service';
import { Subscription, take } from 'rxjs';
import { OnlineInterface } from 'app/online/model/online.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { OnlineTemplateComponent } from 'app/config/online-template/online-template.component';
import { LockService } from 'app/lock/service/lock.service';
import { SharedService } from 'app/services/shared.service';
import { AssignTypeService } from 'app/assigntype/service/assigntype.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    MatButtonModule,
    AsyncPipe,
    NgIf,
    MatIconModule,
    SheetTitlePipe,
    PublicThemePipe,
    MatTooltipModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCheckboxModule
  ]
})
export class ConfigComponent implements OnInit, OnDestroy {
  private formBuilder = inject(UntypedFormBuilder);
  private configService = inject(ConfigService);
  private onlineService = inject(OnlineService);
  private noteService = inject(NoteService);
  private assignTypeService = inject(AssignTypeService);
  private sheetTitleService = inject(SheetTitleService);
  private publicThemeService = inject(PublicThemeService);
  private translocoService = inject(TranslocoService);
  private matSnackBar = inject(MatSnackBar);
  private matDialog = inject(MatDialog);
  private lockService = inject(LockService);
  private sharedService = inject(SharedService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('titleSelect') titleSelect: MatSelect;

  translocoDateFormats: DateFormatStyles[] = ['short', 'medium', 'long', 'full'];

  titles = this.sheetTitleService.getTitles().sort((a, b) => (a.order > b.order ? 1 : -1));

  notes: NoteInterface[] = this.noteService.getNotes();

  publicThemes = this.publicThemeService
    .getPublicThemes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  weekDayBegins: WeekDaysBegin[] = [
    {
      name: this.translocoService.translate('CONFIG_DATE_SUNDAY'),
      value: 0 //Sunday
    },
    {
      name: this.translocoService.translate('CONFIG_DATE_MONDAY'),
      value: 1 //Monday
    }
  ];

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  //is part of the form
  currentConfig = this.configService.getConfig();

  onlineConfig = this.onlineService.getOnline();

  isSharedFolderSelected = false;

  // Config form
  form = this.formBuilder.group({
    closeToOthersDays: this.currentConfig.closeToOthersDays,
    closeToOthersPrayerDays: this.currentConfig.closeToOthersPrayerDays,
    closeToOthersTreasuresEtcDays: this.currentConfig.closeToOthersTreasuresEtcDays,
    defaultFooterNoteId: this.currentConfig.defaultFooterNoteId,
    defaultReportFontSize: this.currentConfig.defaultReportFontSize,
    defaultReportFontSizeHorizontal: this.currentConfig.defaultReportFontSizeHorizontal,
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
    isClassicSortEnabled: this.currentConfig.isClassicSortEnabled,
    s89Title1: this.currentConfig.s89Title1,
    s89Title2: this.currentConfig.s89Title2,
    s89Principal: this.currentConfig.s89Principal,
    s89Assistant: this.currentConfig.s89Assistant,
    s89Date: this.currentConfig.s89Date,
    s89Number: this.currentConfig.s89Number,
    s89RoomsTitle: this.currentConfig.s89RoomsTitle,
    s89NoteBoldPart: this.currentConfig.s89NoteBoldPart,
    s89NoteContentPart: this.currentConfig.s89NoteContentPart,
    s89Version: this.currentConfig.s89Version,
    s89DateVersion: this.currentConfig.s89DateVersion,
    s13Title: this.currentConfig.s13Title,
    s13YearService: this.currentConfig.s13YearService,
    s13TerrNumber: this.currentConfig.s13TerrNumber,
    s13LastCompletedDate: this.currentConfig.s13LastCompletedDate,
    s13AssignedTo: this.currentConfig.s13AssignedTo,
    s13AssignedDate: this.currentConfig.s13AssignedDate,
    s13CompletedDate: this.currentConfig.s13CompletedDate
  });

  //ONLINE SECTION
  servihelperFilesExist = false;
  isPathError = false;
  isValidPath = false;
  copyFilesError = false;
  saveCompleted = false;

  //onlineForm
  onlineForm = this.formBuilder.group({
    isOnline: this.onlineConfig.isOnline,
    path: this.onlineConfig.path
  });

  // Confirm the delete operation
  confirmDelete = false;

  //Restart data
  defaultConfig: ConfigInterface = {
    lang: 'en',
    assignmentHeaderTitle: '',
    assignmentPrincipalTitle: '',
    assignmentAssistantTitle: '',
    assignmentDateTitle: '',
    assignmentAssignTypeTitle: '',
    assignmentThemeTitle: '',
    assignmentRoomTitle: '',
    assignmentNoteTitle: '',
    reportTitle: '',
    defaultFooterNoteId: '',
    defaultReportFontSize: 14,
    defaultReportFontSizeHorizontal: 13,
    defaultReportDateColor: '#FFFFFF',
    defaultWeekDayBegins: 1,
    defaultReportDateFormat: this.translocoDateFormats[3],
    lastMapClick: { lat: 41.254340619843205, lng: -74.35855865478517 }, //warwick
    roles: [],
    role: this.configService.administratorKey,
    lastImportedDate: undefined,
    lastImportedFilename: '',
    lastExportedDate: undefined,
    closeToOthersDays: 30,
    closeToOthersPrayerDays: 30,
    closeToOthersTreasuresEtcDays: 0,
    isClassicSortEnabled: false,
    s89Title1: '',
    s89Title2: '',
    s89Principal: '',
    s89Assistant: '',
    s89Date: '',
    s89Number: '',
    s89RoomsTitle: '',
    s89NoteBoldPart: '',
    s89NoteContentPart: '',
    s89Version: '',
    s89DateVersion: '',
    s13Title: '',
    s13YearService: '',
    s13TerrNumber: '',
    s13LastCompletedDate: '',
    s13AssignedTo: '',
    s13AssignedDate: '',
    s13CompletedDate: ''
  };

  subscription = new Subscription();
  ngOnInit(): void {
    this.subscription.add(
      this.onlineForm.get('isOnline').valueChanges.subscribe(isOnline => {
        if (!isOnline) {
          this.lockService.releaseLock();
          this.moveOnlineFilesBack();

          //Remove the remote path
          this.onlineForm.get('path').setValue('');
          this.resetOnlineFlags();
          this.saveOnline();

          //Open dialog to inform about offline mode
          const dialogRef = this.matDialog.open(OnlineTemplateComponent, {
            data: { msgKey: 'APP_OFFLINE', isOnline: false }
          });

          //Close servihelper
          dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe(() => this.closeApp());
        }
      })
    );

    this.subscription.add(
      this.netStatusOffline$.subscribe(statusOffline => {
        Object.keys(this.form.controls).forEach(key => {
          statusOffline ? this.form.controls[key].disable() : this.form.controls[key].enable();
        });
        this.cdr.detectChanges();
      })
    );
  }

  getTranslationForAssignTypes() {
    return this.assignTypeService.getTranslationForAssignTypes();
  }

  getTranslationForPrayers() {
    return this.assignTypeService.getTranslationForPrayers();
  }

  getTranslationForTreasuresAndOthers() {
    return this.assignTypeService.getTranslationForTreasuresAndOthers();
  }

  ngOnDestroy(): void {
    if (this.form.dirty) {
      this.configService.updateConfig({
        ...this.defaultConfig, //Default config
        ...this.configService.getConfig(), //Current config
        ...this.form.value //Incoming config
      });
      this.matSnackBar.open(
        this.translocoService.translate('CONFIG_SAVED') + ' 🔧 ',
        this.translocoService.translate('CLOSE'),
        { duration: 2500 }
      );
    }
    this.subscription.unsubscribe();
  }

  /**
   * Resets data to default
   */
  restoreAllData() {
    copySync(
      this.configService.backupPath,
      path.join(this.configService.assetsFilesPath, 'source'),
      {
        overwrite: true
      }
    );

    //Close the program
    this.closeApp();
  }

  async checkAndSaveOnlineMode() {
    this.isPathError = false;
    this.isValidPath = false;
    const path = this.onlineForm.get('path').value;
    this.isPathError = !existsSync(path);

    if (this.isPathError) {
      this.onlineForm.controls.path.setErrors({
        required: true
      });
      this.cdr.detectChanges();
      return;
    }
    this.isValidPath = true;

    const dirArray = await readdir(path);

    this.servihelperFilesExist = dirArray.some(item =>
      item.includes(this.configService.configFilename)
    );
    this.cdr.detectChanges();

    if (this.servihelperFilesExist) {
      this.saveOnline();

      //Open dialog to inform about online mode
      const dialogRef = this.matDialog.open(OnlineTemplateComponent, {
        data: { msgKey: 'CONFIG_SERVIHELPER_FILES_FOUND', isOnline: true }
      });

      //Close servihelper
      dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe(() => this.closeApp());
    }
  }

  moveOnlineFilesBack() {
    copySync(this.onlineConfig.path, path.join(this.configService.assetsFilesPath, 'source'), {
      overwrite: true
    });
  }

  moveOfflineFilesToSharedFolder() {
    try {
      this.copyFilesError = false;
      this.saveCompleted = false;
      const remotePath = this.onlineForm.get('path').value;
      copySync(this.configService.sourceFilesPath, remotePath, {
        errorOnExist: true,
        overwrite: false
      });
      //online.json is only available in local
      removeSync(path.join(remotePath, this.configService.onlineFilename));
      this.saveCompleted = true;
      this.cdr.detectChanges();

      this.saveOnline();

      //Open dialog to inform about online mode
      const dialogRef = this.matDialog.open(OnlineTemplateComponent, {
        data: { msgKey: 'CONFIG_SAVE_SHARED_COMPLETED', isOnline: true }
      });

      //Close servihelper
      dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe(() => this.closeApp());
    } catch (err) {
      this.copyFilesError = true;
      this.cdr.detectChanges();
    }
  }

  saveOnline() {
    const onlineConfig: OnlineInterface = {
      isOnline: this.onlineForm.get('isOnline').value,
      path: this.onlineForm.get('path').value
    };
    this.onlineService.updateOnline(onlineConfig);
  }

  resetOnlineFlags() {
    this.servihelperFilesExist = false;
    this.isPathError = false;
    this.isValidPath = false;
    this.copyFilesError = false;
    this.saveCompleted = false;
  }

  closeApp() {
    this.sharedService.closeApp();
  }

  stopPropagation(event) {
    event.stopPropagation();
  }
}
