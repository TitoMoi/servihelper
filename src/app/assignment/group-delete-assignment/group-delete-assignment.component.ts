import { Component } from "@angular/core";
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute, RouterLink } from "@angular/router";

import { AssignmentInterface } from "../model/assignment.model";
import { AssignmentService } from "../service/assignment.service";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule } from "@ngneat/transloco";
import { OnlineService } from "app/online/service/online.service";
import { AsyncPipe, NgIf } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-group-delete-assignment",
  templateUrl: "./group-delete-assignment.component.html",
  styleUrls: ["./group-delete-assignment.component.scss"],
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    AsyncPipe,
    RouterLink,
    MatIconModule,
    NgIf,
  ],
})
export class GroupDeleteAssignmentComponent {
  assignments: AssignmentInterface[];

  assignmentsPromise = this.assignmentService
    .getAssignments()
    .then((assignments) => (this.assignments = assignments));

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  form = this.formBuilder.group({
    date: [undefined, Validators.required],
  });

  constructor(
    private assignmentService: AssignmentService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private onlineService: OnlineService,
    private activatedRoute: ActivatedRoute
  ) {}

  submit() {
    const date: Date = this.form.get("date").value;
    this.assignmentService.massiveAssignmentDelete(date);

    //navigate to parent, one parent for each fragment
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }
}
