import { enableProdMode, importProvidersFrom } from "@angular/core";

import { APP_CONFIG } from "./environments/environment";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { LayoutModule } from "@angular/cdk/layout";
import { NgxEditorModule } from "ngx-editor";
import { MatDialogModule } from "@angular/material/dialog";
import { MatChipsModule } from "@angular/material/chips";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ReactiveFormsModule } from "@angular/forms";
import { withInterceptorsFromDi, provideHttpClient } from "@angular/common/http";
import { provideTranslocoLocale } from "@ngneat/transloco-locale";
import { routes } from "./app/app-routing";
import { provideAnimations } from "@angular/platform-browser/animations";
import { CustomDateAdapter } from "./app/customDateAdapter";
import { DateAdapter, MatNativeDateModule } from "@angular/material/core";
import { provideRouter } from "@angular/router";
import { provideTransloco } from "@ngneat/transloco";
import { TranslocoHttpLoader } from "app/transloco/transloco-loader";

if (APP_CONFIG.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
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
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      ReactiveFormsModule,
      MatToolbarModule,
      MatSidenavModule,
      MatButtonModule,
      MatCardModule,
      MatIconModule,
      MatListModule,
      MatSelectModule,
      MatFormFieldModule,
      MatInputModule,
      MatCheckboxModule,
      MatTooltipModule,
      MatExpansionModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatChipsModule,
      MatDialogModule,
      NgxEditorModule,
      LayoutModule
    ),
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
}).catch((err) => console.error(err));
