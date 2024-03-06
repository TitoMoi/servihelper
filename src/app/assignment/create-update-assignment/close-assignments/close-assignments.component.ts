import { JsonPipe } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { ExhaustedOverlayDataInterface } from "app/assignment/model/assignment.model";

@Component({
  selector: "app-close-assignments",
  standalone: true,
  imports: [JsonPipe],
  templateUrl: "./close-assignments.component.html",
  styleUrl: "./close-assignments.component.scss",
})
export class CloseAssignmentsComponent {
  exhaustedData: ExhaustedOverlayDataInterface = this.exhaustedOverlayData;
  constructor(
    @Inject(CLOSE_ASSIGNMENTS_DATA_TOKEN)
    private exhaustedOverlayData: ExhaustedOverlayDataInterface,
  ) {}
}
