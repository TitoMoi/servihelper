import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { NgFor } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoModule } from "@ngneat/transloco";

@Component({
  selector: "app-warning-assignment",
  templateUrl: "./warning-assignment.component.html",
  styleUrls: ["./warning-assignment.component.scss"],
  standalone: true,
  imports: [TranslocoModule, MatDialogModule, MatIconModule, NgFor],
})
export class WarningAssignmentComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string[]) {}
}
