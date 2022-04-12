import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatExpansionModule } from "@angular/material/expansion";
import { TranslocoModule } from "@ngneat/transloco";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { StatisticsComponent } from "./statistics.component";
import { PrincipalCountComponent } from "./principal-count/principal-count.component";
import { AssistantCountComponent } from "./assistant-count/assistant-count.component";
import { GlobalCountComponent } from "./global-count/global-count.component";
import { StatisticsRoutingModule } from "./statistics-routing.module";
import { MatCheckboxModule } from "@angular/material/checkbox";

@NgModule({
  declarations: [
    StatisticsComponent,
    PrincipalCountComponent,
    AssistantCountComponent,
    GlobalCountComponent,
  ],
  imports: [
    CommonModule,
    StatisticsRoutingModule,
    TranslocoModule,
    TranslocoLocaleModule,
    MatExpansionModule,
    MatCheckboxModule,
  ],
})
export class StatisticsModule {}
