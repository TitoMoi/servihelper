import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { OnlineTemplateDataInterface } from "../model/config.model";
import { TranslocoModule } from "@ngneat/transloco";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-online-template",
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    TranslocoModule,
    MatIconModule,
  ],
  templateUrl: "./online-template.component.html",
  styleUrls: ["./online-template.component.scss"],
})
export class OnlineTemplateComponent {
  constructor(
    public dialogRef: MatDialogRef<OnlineTemplateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OnlineTemplateDataInterface,
  ) {
    dialogRef.disableClose = true; //Ask for explicit read
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
