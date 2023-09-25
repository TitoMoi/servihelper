import { AssignmentService } from "app/assignment/service/assignment.service";

import { Component } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule } from "@ngneat/transloco";
import { OnlineService } from "app/online/service/online.service";
import { AsyncPipe, NgIf } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-delete-assignment",
  templateUrl: "./delete-assignment.component.html",
  styleUrls: ["./delete-assignment.component.scss"],
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    RouterLink,
    AsyncPipe,
    MatIconModule,
    NgIf,
  ],
})
export class DeleteAssignmentComponent {
  netStatusOffline$ = this.onlineService.netStatusOffline$;

  assignmentForm: UntypedFormGroup = this.formBuilder.group({
    id: this.activatedRoute.snapshot.params.id,
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private assignmentService: AssignmentService,
    private router: Router,
    private onlineService: OnlineService,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit(): void {
    this.assignmentService.deleteAssignment(this.assignmentForm.get("id").value);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
