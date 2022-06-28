import { Platform } from "@angular/cdk/platform";
import { Injectable } from "@angular/core";
import { NativeDateAdapter } from "@angular/material/core";
import { TranslocoService } from "@ngneat/transloco";

/** Adapts the native JS Date for use with cdk-based components that work with dates. */
@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  langAndDay;

  translocoService: TranslocoService;

  constructor(translocoService: TranslocoService, platform: Platform) {
    super(translocoService.getActiveLang(), platform);

    this.translocoService = translocoService;
    //The first day of the week
    this.langAndDay = {
      es: 1,
      en: 0,
      ca: 1,
      pt: 1,
      fr: 1,
    };
  }

  override getFirstDayOfWeek(): number {
    const lang = this.translocoService.getActiveLang();
    return this.langAndDay[lang];
  }
}
