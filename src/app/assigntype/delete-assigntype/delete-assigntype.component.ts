import { AssignmentService } from 'app/assignment/service/assignment.service';
import { AssignTypeService } from 'app/assigntype/service/assigntype.service';
import { ParticipantService } from 'app/participant/service/participant.service';

import { Component, inject } from '@angular/core';
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { TranslocoModule } from '@jsverse/transloco';
import { OnlineService } from 'app/online/service/online.service';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-assign-type',
  templateUrl: './delete-assigntype.component.html',
  styleUrls: ['./delete-assigntype.component.css'],
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    AsyncPipe,
    MatIconModule
  ]
})
export class DeleteAssignTypeComponent {
  private formBuilder = inject(UntypedFormBuilder);
  private assignTypeService = inject(AssignTypeService);
  private participantService = inject(ParticipantService);
  private assignmentService = inject(AssignmentService);
  private router = inject(Router);
  private onlineService = inject(OnlineService);
  private activatedRoute = inject(ActivatedRoute);

  assignType = this.assignTypeService.getAssignType(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  assignTypeForm = this.formBuilder.group({
    id: this.assignType.id,
    name: [{ value: this.assignType.name, disabled: true }, Validators.required]
  });

  onSubmit(): void {
    //get id
    const id = this.assignTypeForm.get('id').value;
    //delete the assignType
    this.assignTypeService.deleteAssignType(id);
    //delete from participants assignType
    this.participantService.deleteAssignType(id);

    //delete all assignments that have the assignType
    this.assignmentService.deleteAssignmentsByAssignType(id);

    //navigate to parent
    this.router.navigate(['../..'], {
      relativeTo: this.activatedRoute
    });
  }
}
