import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnInit
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@ngneat/transloco';
import { ConfigService } from 'app/config/service/config.service';
import { PdfService } from 'app/globals/services/pdf.service';
import { LockService } from 'app/lock/service/lock.service';
import { OnlineService } from 'app/online/service/online.service';
import { readdirSync } from 'fs-extra';
import path from 'path';
import { NavigationComponent } from './navigation/navigation.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [NavigationComponent, RouterOutlet, TranslocoDirective, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private configService = inject(ConfigService);
  private onlineService = inject(OnlineService);
  private lockService = inject(LockService);
  private matIconRegistry = inject(MatIconRegistry);
  private domSanitizer = inject(DomSanitizer);
  private pdfService = inject(PdfService);
  private cdr = inject(ChangeDetectorRef);

  // Flag to show a blocking screen with information.
  showLockMsg = false;

  // Flag to show a blocking screen with information.
  showWarningMsg = false;
  //Register when we quit the app, works with the cross X
  @HostListener('window:unload', ['$event'])
  unloadHandler() {
    if (!this.showLockMsg && !this.showWarningMsg) {
      this.lockService.releaseLock();
    }
  }

  constructor() {
    //Get only svg files and then get only the name part (without extension)
    const files = readdirSync(this.configService.iconsFilesPath)
      .filter(file => path.extname(file).toLowerCase() === '.svg')
      .map(file => path.parse(file).name);
    //Register all svg icons
    for (const file of files) {
      this.matIconRegistry.addSvgIcon(
        file,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          path.join(this.configService.iconsFilesPath, file + '.svg')
        )
      );
    }
    for (const file of files) {
      this.matIconRegistry.getNamedSvgIcon(file).subscribe();
    }
  }

  ngOnInit() {
    // If we are online check if we must take the lock from another admin
    if (this.onlineService.getOnline().isOnline) {
      const lockObj = this.lockService.initGetLock();
      if (lockObj.lock) {
        if (this.lockService.isTimestampNotBeingUpdated(15)) {
          // Why is lock true and timestamp more than 15 mins?
          // Maybe he began to work with internet and lost it between and the lock file was not updated
          // or is not syncing the files because it's manually paused.
          // This can lead to a future problem, he will override the work of admin2
          // when he recovers internet or resumes the pending files...
          // The best approach is to show a message so the current admin can decide what to do.
          this.showWarningMsg = true;
        } else {
          // We have the lock and the timestamp is less than 15 mins
          this.showLockMsg = true;
        }
      }
      this.onlineService.prepareCheckInternetAccess();
    }

    // Lang changes
    this.pdfService.registerOnLangChange();
  }

  /**
   * Admin confirms that he wants to work, even at risk of possible files being overrided later
   */
  proceedWithTheInit() {
    this.lockService.updateTimestamp();
    this.lockService.setIntervalIsAdminIdle();
    this.showWarningMsg = false;
    this.cdr.detectChanges();
  }
}
