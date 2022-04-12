import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";

import { HomeComponent } from "app/home/home.component";
import { NavigationComponent } from "app/navigation/navigation.component";
import { AppRoutingModule } from "./app-routing.module";
import { TranslocoRootModule } from "./transloco/translocoRoot.module";
import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent, HomeComponent, NavigationComponent],
  imports: [
    BrowserAnimationsModule,
    AppRoutingModule,
    TranslocoRootModule,
    HttpClientModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
