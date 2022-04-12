import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ConfigRoutingModule } from "./config-routing.module";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { ConfigComponent } from "./config.component";
import { TranslocoModule } from "@ngneat/transloco";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

@NgModule({
  declarations: [ConfigComponent],
  imports: [
    CommonModule,
    ConfigRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    TranslocoModule,
  ],
})
export class ConfigModule {}
