import { APP_CONFIG } from "environments/environment";
import { Observable } from "rxjs";

import { HttpClient } from "@angular/common/http";
import { Injectable, NgModule } from "@angular/core";
import {
  Translation,
  TRANSLOCO_CONFIG,
  TRANSLOCO_LOADER,
  translocoConfig,
  TranslocoLoader,
  TranslocoModule,
} from "@ngneat/transloco";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";

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
/* https://www.loc.gov/standards/iso639-2/php/code_list.php */
@NgModule({
  imports: [
    TranslocoLocaleModule.forRoot({
      langToLocaleMapping: {
        es: "es-ES",
        en: "en-US",
        ca: "ca-ES",
        pt: "pt-PT",
        fr: "fr-FR",
        it: "it-IT",
        de: "de-DE",
        ru: "ru-RU",
        ja: "ja-JA",
        ko: "ko-KO",
        hr: "hr-HR",
        zhCN: "zh-CN",
        hi: "hi-HI",
        el: "el-EL",
        bn: "bn-BN",
        nl: "nl-NL",
        ro: "ro-RO",
        tr: "tr-TR",
        pl: "pl-PL",
      },
    }),
  ],
  exports: [TranslocoModule],
  providers: [
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: [
          "en",
          "es",
          "ca",
          "pt",
          "fr",
          "it",
          "de",
          "el",
          "ru",
          "ja",
          "ko",
          "hi",
          "zhCN",
          "bn",
          "nl",
          "ro",
          "tr",
          "pl",
        ],
        defaultLang: "en",
        reRenderOnLangChange: true,
        prodMode: APP_CONFIG.production,
        flatten: {
          aot: APP_CONFIG.production,
        },
      }),
    },
    { provide: TRANSLOCO_LOADER, useClass: TranslocoHttpLoader },
  ],
})
export class TranslocoRootModule {}
