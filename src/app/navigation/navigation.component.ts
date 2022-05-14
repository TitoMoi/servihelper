import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { MatSelectChange } from "@angular/material/select";
import { DomSanitizer } from "@angular/platform-browser";
import { TranslocoService } from "@ngneat/transloco";
import { ConfigService } from "app/config/service/config.service";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

@Component({
  selector: "app-navigation",
  templateUrl: "./navigation.component.html",
  styleUrls: ["./navigation.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent implements OnInit {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  icons: string[] = [
    "menu",
    "room",
    "abc",
    "notes",
    "participants",
    "assignment",
    "statistics",
    "config",
    "qa",
  ];
  availableLangs = undefined;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public translocoService: TranslocoService,
    public configService: ConfigService,
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    for (const iconFileName of this.icons) {
      this.matIconRegistry.addSvgIcon(
        iconFileName,
        this.sanitizer.bypassSecurityTrustResourceUrl(
          "assets/icons/" + iconFileName + ".svg"
        )
      );
    }
  }

  ngOnInit() {
    this.availableLangs = this.translocoService.getAvailableLangs();

    this.translocoService = this.translocoService.setActiveLang(
      this.configService.getConfig().lang
    );
  }

  /**
   *
   * @param languageChange event of select change
   */
  updateLang(matSelectChange: MatSelectChange) {
    this.translocoService.setActiveLang(matSelectChange.value);

    //Save the lang
    this.configService.updateConfigByKey("lang", matSelectChange.value);
  }
}
