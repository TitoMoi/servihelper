/* eslint-disable complexity */
import { JsonPipe } from "@angular/common";
import { ChangeDetectionStrategy } from "@angular/core";
import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { TranslocoDirective } from "@ngneat/transloco";
import { TranslocoDatePipe } from "@ngneat/transloco-locale";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignTypePipe } from "app/assigntype/pipe/assign-type.pipe";
import { CloseAssignmentsDataContext } from "app/assignment/model/assignment.model";

@Component({
  selector: "app-close-assignments",
  standalone: true,
  imports: [
    JsonPipe,
    AssignTypePipe,
    TranslocoDatePipe,
    TranslocoDirective,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: "./close-assignments.component.html",
  styleUrl: "./close-assignments.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseAssignmentsComponent {
  closeAssignments: AssignmentInterface[] = this.closeAssignmentsData.assignments;
  isRedClock = this.closeAssignmentsData.isRedClock;
  constructor(
    @Inject(MAT_DIALOG_DATA) private closeAssignmentsData: CloseAssignmentsDataContext,
  ) {}
}
