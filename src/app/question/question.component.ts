import { Component } from "@angular/core";
import { SharedService } from "app/services/shared.service";
import { TranslocoModule } from "@ngneat/transloco";

@Component({
    selector: "app-question",
    templateUrl: "./question.component.html",
    styleUrls: ["./question.component.scss"],
    imports: [TranslocoModule]
})
export class QuestionComponent {
  appVersion = this.sharedService.appVersion;

  constructor(private sharedService: SharedService) {}
}
