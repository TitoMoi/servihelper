import { Component, OnDestroy, OnInit } from "@angular/core";
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
import { AsyncPipe, JsonPipe } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { Subscription, map, skip } from "rxjs";
import { AssignTypeNamePipe } from "app/assigntype/pipe/assign-type-name.pipe";
import { AssignTypePipe } from "app/assigntype/pipe/assign-type.pipe";
import { ConfigService } from "app/config/service/config.service";

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
    JsonPipe,
    AssignTypePipe,
    AssignTypeNamePipe,
  ],
})
export class GroupDeleteAssignmentComponent implements OnInit, OnDestroy {
  assignments: AssignmentInterface[];

  assignmentsPromise = this.assignmentService
    .getAssignments()
    .then((assignments) => (this.assignments = assignments));

  currentAssignTypesIdsByRole = this.assignTypeService.getAssignTypesIdsByRole();

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  form = this.formBuilder.group({
    date: [undefined, Validators.required],
  });

  assignmentsToDelete$ = this.form
    .get("date")
    .valueChanges.pipe(
      map((date) =>
        this.assignmentService
          .getAssignmentsByDate(date)
          .filter((a) => this.currentAssignTypesIdsByRole.includes(a.assignType))
      )
    );

  subscription = new Subscription();

  constructor(
    private assignmentService: AssignmentService,
    private assignTypeService: AssignTypeService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private onlineService: OnlineService,
    private configService: ConfigService,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit(): void {
    //skip the first one as role$ is a hot observable
    this.subscription.add(
      this.configService.role$.pipe(skip(1)).subscribe(() => {
        this.currentAssignTypesIdsByRole = this.assignTypeService.getAssignTypesIdsByRole();
        this.form.enable(); //Trigger enable just to emit a valueChanges
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  submit() {
    const date: Date = this.form.get("date").value;
    this.assignmentService.massiveAssignmentDelete(date, this.currentAssignTypesIdsByRole);

    //navigate to parent, one parent for each fragment
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }
}
