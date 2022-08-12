import { ConfigService } from "app/config/service/config.service";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { DateAdapter } from "@angular/material/core";
import { MatSelectChange } from "@angular/material/select";
import { TranslocoService } from "@ngneat/transloco";

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
  availableLangs = undefined;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public translocoService: TranslocoService,
    private dateAdapter: DateAdapter<any>,
    public configService: ConfigService
  ) {}

  ngOnInit() {
    const lang = this.configService.getConfig().lang;

    this.availableLangs = this.translocoService.getAvailableLangs();

    this.setLang(lang);
    this.setLocale(lang);
  }

  /**
   *
   * @param languageChange event of select change
   */
  updateLang(matSelectChange: MatSelectChange) {
    this.setLang(matSelectChange.value);

    //Save the lang to the config
    this.configService.updateConfigByKey("lang", matSelectChange.value);

    this.setLocale(matSelectChange.value);
  }

  /**
   *
   * @param lang the lang
   */
  setLang(lang) {
    this.translocoService = this.translocoService.setActiveLang(lang);
  }

  /**
   * https://www.loc.gov/standards/iso639-2/php/code_list.php
   *
   * @param locale
   */
  setLocale(locale) {
    //Save the locale
    if (locale === "zhCN") locale = "zh";
    this.dateAdapter.setLocale(locale);
  }
}
