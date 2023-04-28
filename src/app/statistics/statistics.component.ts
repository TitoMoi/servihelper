import { Component } from "@angular/core";
import { AssistantCountComponent } from "./assistant-count/assistant-count.component";
import { PrincipalCountComponent } from "./principal-count/principal-count.component";
import { GlobalCountComponent } from "./global-count/global-count.component";

@Component({
  selector: "app-statistics",
  templateUrl: "./statistics.component.html",
  styleUrls: ["./statistics.component.scss"],
  standalone: true,
  imports: [GlobalCountComponent, PrincipalCountComponent, AssistantCountComponent],
})
export class StatisticsComponent {}
