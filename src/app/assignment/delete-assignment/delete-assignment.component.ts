import { AssignmentService } from 'app/assignment/service/assignment.service';

import { Component, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TranslocoModule } from '@jsverse/transloco';
import { OnlineService } from 'app/online/service/online.service';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AssignTypeService } from 'app/assigntype/service/assigntype.service';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-delete-assignment',
  templateUrl: './delete-assignment.component.html',
  styleUrls: ['./delete-assignment.component.scss'],
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
export class DeleteAssignmentComponent {
  private formBuilder = inject(UntypedFormBuilder);
  private assignmentService = inject(AssignmentService);
  private assignTypeService = inject(AssignTypeService);
  private router = inject(Router);
  private onlineService = inject(OnlineService);
  private activatedRoute = inject(ActivatedRoute);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  a = this.assignmentService.getAssignment(this.activatedRoute.snapshot.params.id);

  assignmentForm: UntypedFormGroup = this.formBuilder.group({
    id: this.activatedRoute.snapshot.params.id,
    name: [{ value: this.assignTypeService.getAssignType(this.a.assignType).name, disabled: true }]
  });

  onSubmit(): void {
    this.assignmentService.deleteAssignment(this.assignmentForm.get('id').value);

    //navigate to parent
    this.router.navigate(['../..'], {
      relativeTo: this.activatedRoute
    });
  }
}
