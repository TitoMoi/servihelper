import { importProvidersFrom } from "@angular/core";

import { APP_CONFIG } from "./environments/environment";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { withInterceptorsFromDi, provideHttpClient } from "@angular/common/http";
import { provideTranslocoLocale } from "@ngneat/transloco-locale";
import { routes } from "./app/app-routing";
import { provideAnimations } from "@angular/platform-browser/animations";
import { CustomDateAdapter } from "./app/customDateAdapter";
import { DateAdapter, MatNativeDateModule } from "@angular/material/core";
import { provideRouter } from "@angular/router";
import { provideTransloco } from "@ngneat/transloco";
import { TranslocoHttpLoader } from "app/transloco/transloco-loader";

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes), //withDebugTracing()
    provideTransloco({
      config: {
        availableLangs: [
          "en",
          "es",
          "ca",
          "pt",
          "fr",
          "it",
          "de",
          "el",
          "hr",
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
      },
      loader: TranslocoHttpLoader,
    }),
    provideTranslocoLocale({
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
    importProvidersFrom(MatNativeDateModule),
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
}).catch((err) => console.error(err));
