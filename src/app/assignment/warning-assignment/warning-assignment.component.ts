import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-warning-assignment",
  templateUrl: "./warning-assignment.component.html",
  styleUrls: ["./warning-assignment.component.scss"],
})
export class WarningAssignmentComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string[]) {
    console.log(data);
  }
}
