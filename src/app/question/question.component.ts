import { Component } from "@angular/core";
import { SharedService } from "app/services/shared.service";

@Component({
  selector: "app-question",
  templateUrl: "./question.component.html",
  styleUrls: ["./question.component.scss"],
})
export class QuestionComponent {
  appVersion = this.sharedService.appVersion;

  constructor(private sharedService: SharedService) {}
}
