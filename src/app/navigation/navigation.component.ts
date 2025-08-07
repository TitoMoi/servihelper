import { ConfigService } from 'app/config/service/config.service';
import { Observable, of } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MatOptionModule, NativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { SharedService } from 'app/globals/services/shared.service';
import { OnlineService } from 'app/online/service/online.service';
import { RoleInterface } from 'app/roles/model/role.model';
import { shell } from 'electron';
import { GitHubDataInterface } from './model/navigation.model';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslocoModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    AsyncPipe
  ]
})
export class NavigationComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private breakpointObserver = inject(BreakpointObserver);
  private translocoService = inject(TranslocoService);
  private dateAdapter = inject<DateAdapter<NativeDateAdapter>>(DateAdapter);
  private configService = inject(ConfigService);
  private onlineService = inject(OnlineService);
  private sharedService = inject(SharedService);
  private httpClient = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  hideSidenav;

  config$ = this.configService.config$;

  config = this.configService.getConfig();

  lang = this.config.lang;

  roles: RoleInterface[] = this.config.roles;

  currentRoleId = this.config.role;

  online$ = this.onlineService.online$;

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  administratorKey = this.configService.administratorKey;

  availableLangs = undefined;

  //As an alternative to this, we can put a button so the user can manually check
  queryGithubInterval$ = of(Math.random() > 0.55).pipe(
    filter(doQuery => doQuery),
    switchMap(() => this.queryGitHub$)
  );

  queryGitHub$ = this.httpClient
    .get<GitHubDataInterface>('https://api.github.com/repos/titoMoi/servihelper/releases/latest')
    .pipe(filter(githubData => githubData.tag_name !== this.sharedService.appVersion));

  roleForm = this.formBuilder.group({
    roleId: [this.administratorKey]
  });

  #hideSidenav$: Observable<boolean> = this.breakpointObserver
    .observe([
      Breakpoints.Large,
      Breakpoints.Medium,
      Breakpoints.Small,
      Breakpoints.Tablet,
      Breakpoints.Handset
    ])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  ngOnInit() {
    this.availableLangs = this.translocoService.getAvailableLangs();

    //Special condition for the ca because doesnt have the s89 in ca
    if (this.lang === 'ca') {
      this.translocoService.load('es').subscribe();
    }

    this.setLang(this.lang);
    this.setLocale(this.lang);

    //Create only 1 subscription on the model, as i need it after to check if drawer can be closed
    this.#hideSidenav$.subscribe(hideSidenav => {
      this.hideSidenav = hideSidenav;
      this.cdr.detectChanges();
    });

    this.config$.subscribe(config => {
      this.currentRoleId = config.role;
      this.roles = config.roles;
      this.lang = config.lang;
      this.cdr.detectChanges();
    });
  }

  /**
   *
   * @param languageChange event of select change
   */
  updateLang(matSelectChange: MatSelectChange) {
    //Special condition for the ca because doesnt have the s89 in ca
    if (matSelectChange.value === 'ca') {
      this.translocoService.getTranslation('es');
    }

    this.setLang(matSelectChange.value);

    //Save the lang to the config
    this.configService.updateConfigByKey('lang', matSelectChange.value);

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
    if (locale === 'zhCN') {
      locale = 'zh';
    }
    this.dateAdapter.setLocale(locale);
  }

  updateRole(event: MatSelectChange) {
    const config = this.configService.getConfig();
    config.role = event.value;
    this.configService.updateConfig(config);
  }

  openExternalServihelperRepository() {
    shell.openExternal('https://github.com/TitoMoi/servihelper/releases');
  }

  closeDrawer(drawer: MatSidenav) {
    if (this.hideSidenav) {
      drawer.close();
    }
  }
}
