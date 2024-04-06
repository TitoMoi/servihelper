import { ConfigService } from "app/config/service/config.service";
import { Component, HostListener, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { PdfService } from "./services/pdf.service";
import { RouterOutlet } from "@angular/router";
import { NavigationComponent } from "./navigation/navigation.component";
import { OnlineService } from "app/online/service/online.service";
import { LockService } from "app/lock/service/lock.service";
import { readdirSync } from "fs-extra";
import path from "path";
import { TranslocoDirective } from "@ngneat/transloco";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: true,
  imports: [NavigationComponent, RouterOutlet, TranslocoDirective],
})
export class AppComponent implements OnInit {
  //Flag to show a blocking screen or render the app or not if its being used by another admin (online mode)
  showLockMsg = false;

  //Register when we quit the app, works with the cross X
  @HostListener("window:unload", ["$event"])
  unloadHandler() {
    if (!this.showLockMsg) {
      this.lockService.releaseLock();
    }
  }

  constructor(
    private configService: ConfigService,
    private onlineService: OnlineService,
    private lockService: LockService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private pdfService: PdfService,
  ) {
    //Get only svg files and then get only the name part (without extension)
    const files = readdirSync(this.configService.iconsFilesPath)
      .filter((file) => path.extname(file).toLowerCase() === ".svg")
      .map((file) => path.parse(file).name);
    //Register all svg icons
    for (const file of files) {
      this.matIconRegistry.addSvgIcon(
        file,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          path.join(this.configService.iconsFilesPath, file + ".svg"),
        ),
      );
    }
    for (const file of files) {
      this.matIconRegistry.getNamedSvgIcon(file).subscribe();
    }
  }

  ngOnInit() {
    if (this.onlineService.getOnline().isOnline) {
      if (this.lockService.lockObj.lock) {
        this.showLockMsg = true;
        return;
      }
      this.onlineService.prepareCheckInternetAccess();
    }

    // Lang changes
    this.pdfService.registerOnLangChange();
  }
}
