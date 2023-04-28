import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { ParticipantDynamicInterface } from "app/participant/model/participant.model";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { NgFor } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";

@Component({
  selector: "app-info-assignment",
  templateUrl: "./info-assignment.component.html",
  styleUrls: ["./info-assignment.component.scss"],
  standalone: true,
  imports: [TranslocoModule, MatDialogModule, MatIconModule, NgFor, TranslocoLocaleModule],
})
export class InfoAssignmentComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ParticipantDynamicInterface[]) {}
}
