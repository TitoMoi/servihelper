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
import { NgIf } from "@angular/common";
import { SharedService } from "./services/shared.service";
import { TranslocoModule } from "@ngneat/transloco";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: true,
  imports: [NavigationComponent, RouterOutlet, NgIf, TranslocoModule],
})
export class AppComponent implements OnInit {
  //Flag to render the app when the paths are resolved (online or offline)
  dataLoaded = false;
  showLockMsg = false;

  //Register when we quit the app, works with the cross X
  @HostListener("window:unload", ["$event"])
  unloadHandler() {
    this.lockService.releaseLock(true);
  }

  constructor(
    private sharedService: SharedService,
    private configService: ConfigService,
    private onlineService: OnlineService,
    private lockService: LockService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private pdfService: PdfService
  ) {
    //Get only svg files and then get only the name part (without extension)
    const files = readdirSync(this.configService.iconsFilesPath)
      .filter((file) => path.extname(file).toLowerCase() === ".svg")
      .map((file) => path.parse(file).name);
    //Register all svg icons
    for (let file of files) {
      this.matIconRegistry.addSvgIcon(
        file,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          path.join(this.configService.iconsFilesPath, file + ".svg")
        )
      );
    }
    for (const file of files) {
      this.matIconRegistry.getNamedSvgIcon(file).subscribe();
    }
  }

  ngOnInit() {
    this.pdfService.registerOnLangChange();
    const online = this.onlineService.getOnline();
    this.configService.prepareFilePaths(online); //1

    //LOCK?
    if (online.isOnline) {
      const lockObj = this.lockService.getLock();
      this.lockService.checkDeathEnd();

      if (lockObj.lock) {
        this.showLockMsg = true;
      } else {
        this.lockService.takeLock();
        this.loadData();
      }
    } else {
      this.loadData();
    }
  }
  loadData() {
    this.configService.getConfig();
    this.dataLoaded = this.sharedService.getAllData();
  }
}
