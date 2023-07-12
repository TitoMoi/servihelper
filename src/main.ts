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
import { MatTableModule } from "@angular/material/table";
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
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { routes } from "./app/app-routing";
import { provideAnimations } from "@angular/platform-browser/animations";
import { CustomDateAdapter } from "./app/customDateAdapter";
import { TranslocoRootModule } from "./app/transloco/translocoRoot.module";
import { DateAdapter, MatNativeDateModule } from "@angular/material/core";
import { provideRouter } from "@angular/router";

if (APP_CONFIG.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), //withDebugTracing()
    importProvidersFrom(
      TranslocoRootModule,
      TranslocoLocaleModule,
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
      MatTableModule,
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
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
  ],
}).catch((err) => console.error(err));
