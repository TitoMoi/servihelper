import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ParticipantDynamicInterface } from "app/participant/model/participant.model";

@Component({
  selector: "app-info-assignment",
  templateUrl: "./info-assignment.component.html",
  styleUrls: ["./info-assignment.component.scss"],
})
export class InfoAssignmentComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ParticipantDynamicInterface[]
  ) {
    console.log(data);
  }
}
