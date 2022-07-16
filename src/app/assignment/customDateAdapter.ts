import { Platform } from "@angular/cdk/platform";
import { Injectable } from "@angular/core";
import { NativeDateAdapter } from "@angular/material/core";
import { TranslocoService } from "@ngneat/transloco";
import { ConfigService } from "app/config/service/config.service";

/** Adapts the native JS Date for use with cdk-based components that work with dates. */
@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  constructor(
    translocoService: TranslocoService,
    platform: Platform,
    private configService: ConfigService
  ) {
    super(translocoService.getActiveLang(), platform);
  }

  override getFirstDayOfWeek(): number {
    //temporal "nullish" condition, remove in the long future
    return this.configService.getConfig().defaultWeekDayBegins ?? 1;
  }
}
