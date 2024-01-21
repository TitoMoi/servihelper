import { ConfigService } from "app/config/service/config.service";

import { Injectable } from "@angular/core";
import { NativeDateAdapter } from "@angular/material/core";
import { TranslocoService } from "@ngneat/transloco";

/** Adapts the native JS Date for use with cdk-based components that work with dates. */
@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  constructor(
    translocoService: TranslocoService,
    private configService: ConfigService,
  ) {
    super(translocoService.getActiveLang());
  }

  override getFirstDayOfWeek(): number {
    return this.configService.getConfig().defaultWeekDayBegins;
  }
}
