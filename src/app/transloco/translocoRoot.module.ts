import { HttpClient } from "@angular/common/http";
import { Injectable, NgModule } from "@angular/core";
import { Observable } from "rxjs";
import {
  TRANSLOCO_LOADER,
  Translation,
  TranslocoLoader,
  TRANSLOCO_CONFIG,
  translocoConfig,
  TranslocoModule,
} from "@ngneat/transloco";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { APP_CONFIG } from "environments/environment";
@Injectable({ providedIn: "root" })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<Translation> {
    return this.http.get<Translation>(
      APP_CONFIG.production
        ? __dirname + `/assets/i18n/${lang}.json`
        : `assets/i18n/${lang}.json`
    );
  }
}

@NgModule({
  imports: [
    TranslocoLocaleModule.forRoot({
      langToLocaleMapping: {
        es: "es-ES",
        en: "en-US",
        ca: "ca-ES",
        pt: "pt-PT",
      },
    }),
  ],
  exports: [TranslocoModule],
  providers: [
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: ["en", "es", "ca", "pt"],
        defaultLang: "en",
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: APP_CONFIG.production,
      }),
    },
    { provide: TRANSLOCO_LOADER, useClass: TranslocoHttpLoader },
  ],
})
export class TranslocoRootModule {}