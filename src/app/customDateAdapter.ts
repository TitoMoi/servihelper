import { ConfigService } from 'app/config/service/config.service';

import { Injectable, inject } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import { TranslocoService } from '@jsverse/transloco';

/** Adapts the native JS Date for use with cdk-based components that work with dates. */
@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  private configService = inject(ConfigService);

  constructor() {
    const translocoService = inject(TranslocoService);

    super(translocoService.getActiveLang());
  }

  override getFirstDayOfWeek(): number {
    return this.configService.getConfig().defaultWeekDayBegins;
  }
}
