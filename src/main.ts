import { importProvidersFrom, inject, provideAppInitializer } from "@angular/core";

import { APP_CONFIG } from "./environments/environment";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { provideHttpClient } from "@angular/common/http";
import { provideTranslocoLocale } from "@ngneat/transloco-locale";
import { routes } from "./app/app-routing";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { CustomDateAdapter } from "./app/customDateAdapter";
import { DateAdapter, MatNativeDateModule } from "@angular/material/core";
import { provideRouter } from "@angular/router";
import { provideTransloco } from "@ngneat/transloco";
import { TranslocoHttpLoader } from "app/transloco/transloco-loader";
import { ConfigService } from "app/config/service/config.service";
import { OnlineService } from "app/online/service/online.service";
import { RoomService } from "app/room/service/room.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { PolygonService } from "app/map/territory/service/polygon.service";
import { TerritoryService } from "app/map/territory/service/territory.service";
import { TerritoryGroupService } from "app/map/territory-group/service/territory-group.service";

bootstrapApplication(AppComponent, {
  providers: [
    provideAppInitializer(() => {
      const initializerFn = (() => {
        const configService = inject(ConfigService);
        const onlineService = inject(OnlineService);

        const roomService = inject(RoomService);
        const assignTypeService = inject(AssignTypeService);
        const participantService = inject(ParticipantService);
        const assignmentService = inject(AssignmentService);

        const polygonService = inject(PolygonService);
        const territoryService = inject(TerritoryService);
        const territoryGroupService = inject(TerritoryGroupService);

        // Get the online object status
        const onlineObj = onlineService.getOnline();

        // Adapt paths based on online or offline
        configService.prepareFilePaths(onlineObj);

        // Load data, altough it may seem expensive, preparing the cache here avoids to repeat a getX on every
        // component that needs the data
        roomService.getRooms();
        assignTypeService.getAssignTypes();
        participantService.getParticipants();
        assignmentService.getAssignments();

        polygonService.getPolygons();
        territoryService.getTerritories();
        territoryGroupService.getTerritoryGroups();

        return () =>
          configService.getConfigAsync().then((config) => {
            configService.config = config;
            configService.role = config.role;

            configService.hasChanged = false;
          });
      })();
      return initializerFn();
    }),
    provideAnimationsAsync(),
    provideHttpClient(),
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
