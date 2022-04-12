import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { DomSanitizer } from "@angular/platform-browser";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { MatSelectChange } from "@angular/material/select";
import { getBrowserLang, TranslocoService } from "@ngneat/transloco";
import { MatIconRegistry } from "@angular/material/icon";
import { ConfigService } from "app/config/service/config.service";
import { ConfigInterface } from "app/config/model/config.model";

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

  icons: string[];
  //The langs available
  availableLangs;
  //The selected or browser default lang
  selectedLang;
  //Lang seted
  isLangSeted;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private translocoService: TranslocoService,
    private configService: ConfigService,
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.icons = [
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
    this.isLangSeted = false;
  }
  async ngOnInit(): Promise<void> {
    //Available langs
    this.availableLangs = this.translocoService.getAvailableLangs();

    //Register icons
    for (const iconFileName of this.icons) {
      this.matIconRegistry.addSvgIcon(
        iconFileName,
        this.sanitizer.bypassSecurityTrustResourceUrl(
          "assets/icons/" + iconFileName + ".svg"
        )
      );
    }

    await this.getActiveLangAndSetLangAndLocale();
  }

  async updateLang(languageChange: MatSelectChange) {
    this.translocoService.setActiveLang(languageChange.value);

    //Save the lang config
    const config: ConfigInterface = await this.configService.getConfig();
    config.lang = languageChange.value;
    await this.configService.updateConfig(config);
  }

  async getActiveLangAndSetLangAndLocale() {
    const config: ConfigInterface = await this.configService.getConfig();
    //Set the lang based on the config
    if (config.lang) {
      this.translocoService = this.translocoService.setActiveLang(config.lang);
    }

    if (this.translocoService.getActiveLang() === config.lang) {
      this.isLangSeted = true;
    }

    //else, set the lang based on the browser
    if (!this.isLangSeted) {
      const lang = getBrowserLang();
      this.translocoService = this.translocoService.setActiveLang(lang);
      this.isLangSeted = true;
    }

    this.selectedLang = this.translocoService.getActiveLang();
  }
}
