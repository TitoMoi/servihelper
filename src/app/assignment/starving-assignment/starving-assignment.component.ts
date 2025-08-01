import { Component, Inject, ChangeDetectionStrategy } from "@angular/core";
import { TranslocoDirective } from "@ngneat/transloco";

import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { StarvingAssignmentsDataContext } from "../model/assignment.model";
@Component({
    selector: "app-starving-assignment",
    imports: [TranslocoDirective, MatIconModule, MatDialogModule],
    templateUrl: "./starving-assignment.component.html",
    styleUrl: "./starving-assignment.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarvingAssignmentComponent {
  participants = this.starvingDataContext.participants;

  constructor(
    @Inject(MAT_DIALOG_DATA) private starvingDataContext: StarvingAssignmentsDataContext,
  ) {}
}
