import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslocoModule } from "@ngneat/transloco";
import { QuestionRoutingModule } from "./question-routing.module";
import { QuestionComponent } from "./question.component";

@NgModule({
  declarations: [QuestionComponent],
  imports: [CommonModule, QuestionRoutingModule, TranslocoModule],
})
export class QuestionModule {}
