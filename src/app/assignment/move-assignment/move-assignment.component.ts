import { Component, inject } from '@angular/core';
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssignmentInterface } from '../model/assignment.model';
import { AssignmentService } from '../service/assignment.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { TranslocoModule } from '@jsverse/transloco';
import { OnlineService } from 'app/online/service/online.service';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-move-assignment',
  templateUrl: './move-assignment.component.html',
  styleUrls: ['./move-assignment.component.scss'],
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
  ]
})
export class MoveAssignmentComponent {
  private assignmentService = inject(AssignmentService);
  private formBuilder = inject(UntypedFormBuilder);
  private router = inject(Router);
  private onlineService = inject(OnlineService);
  private activatedRoute = inject(ActivatedRoute);

  assignments: AssignmentInterface[] = this.assignmentService.getAssignments();

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  form = this.formBuilder.group({
    originDate: [undefined, Validators.required],
    destinyDate: [undefined, Validators.required]
  });

  submit() {
    const initialDate: Date = this.form.get('originDate').value;
    const destinyDate: Date = this.form.get('destinyDate').value;
    this.assignmentService.massiveDateChange(initialDate, destinyDate);

    //navigate to parent, one parent for each fragment
    this.router.navigate(['..'], {
      relativeTo: this.activatedRoute
    });
  }
}
