import { Component } from "@angular/core";
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AssignmentInterface } from "../model/assignment.model";
import { AssignmentService } from "../service/assignment.service";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule } from "@ngneat/transloco";
import { OnlineService } from "app/online/service/online.service";
import { AsyncPipe } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-move-assignment",
  templateUrl: "./move-assignment.component.html",
  styleUrls: ["./move-assignment.component.scss"],
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    RouterLink,
    AsyncPipe,
    MatIconModule
],
})
export class MoveAssignmentComponent {
  assignments: AssignmentInterface[];

  assignmentsPromise = this.assignmentService
    .getAssignments()
    .then((assignments) => (this.assignments = assignments));

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  form = this.formBuilder.group({
    originDate: [undefined, Validators.required],
    destinyDate: [undefined, Validators.required],
  });

  constructor(
    private assignmentService: AssignmentService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private onlineService: OnlineService,
    private activatedRoute: ActivatedRoute
  ) {}

  submit() {
    const initialDate: Date = this.form.get("originDate").value;
    const destinyDate: Date = this.form.get("destinyDate").value;
    this.assignmentService.massiveDateChange(initialDate, destinyDate);

    //navigate to parent, one parent for each fragment
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }
}
