import { ConfigService } from "app/config/service/config.service";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { DateAdapter, NativeDateAdapter } from "@angular/material/core";
import { MatSelectChange } from "@angular/material/select";
import { TranslocoService } from "@ngneat/transloco";
import { shell } from "electron";
import { SharedService } from "app/services/shared.service";
import { HttpClient } from "@angular/common/http";
import { GitHubDataInterface } from "./model/navigation.model";
import { ConfigInterface } from "app/config/model/config.model";
import { RoleInterface } from "app/roles/model/role.model";
import { UntypedFormBuilder } from "@angular/forms";

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

  config = this.configService.getConfig();

  lang = this.config.lang;

  currentRoleId = this.config.role;

  administratorKey = this.configService.administratorKey;

  availableLangs = undefined;

  isNewVersion = false;

  appVersion = this.sharedService.appVersion;

  queryGitHub$ = this.httpClient.get<GitHubDataInterface>(
    "https://api.github.com/repos/titoMoi/servihelper/releases/latest"
  );

  config$: Observable<ConfigInterface> = this.configService.config$;

  roles$: Observable<RoleInterface[]> = this.config$.pipe(
    map((config) => config.roles)
  );

  currentRoleId$: Observable<string> = this.config$.pipe(
    map((config) => config.role)
  );

  roleForm = this.formBuilder.group({
    roleId: [this.administratorKey],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private breakpointObserver: BreakpointObserver,
    public translocoService: TranslocoService,
    private dateAdapter: DateAdapter<NativeDateAdapter>,
    public configService: ConfigService,
    private sharedService: SharedService,
    private httpClient: HttpClient
  ) {}

  ngOnInit() {
    this.availableLangs = this.translocoService.getAvailableLangs();

    this.setLang(this.lang);
    this.setLocale(this.lang);
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

  updateRole(event: MatSelectChange) {
    const config = this.configService.getConfig();
    config.role = event.value;
    this.configService.updateConfig(config);
  }

  openExternalServihelperRepository() {
    shell.openExternal("https://github.com/TitoMoi/servihelper/releases");
  }
}
