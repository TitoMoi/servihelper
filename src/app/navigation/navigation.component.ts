import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { MatSelectChange } from "@angular/material/select";
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
  availableLangs = undefined;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public translocoService: TranslocoService,
    public configService: ConfigService
  ) {}

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
