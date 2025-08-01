import { AssignmentService } from 'app/assignment/service/assignment.service';
import { ParticipantInterface } from 'app/participant/model/participant.model';
import { ParticipantService } from 'app/participant/service/participant.service';

import { Component, inject } from '@angular/core';
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { TranslocoModule } from '@ngneat/transloco';
import { OnlineService } from 'app/online/service/online.service';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TerritoryService } from 'app/map/territory/service/territory.service';

@Component({
  selector: 'app-delete-participant',
  templateUrl: './delete-participant.component.html',
  styleUrls: ['./delete-participant.component.css'],
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
export class DeleteParticipantComponent {
  private formBuilder = inject(UntypedFormBuilder);
  private participantService = inject(ParticipantService);
  private assignmentService = inject(AssignmentService);
  private territoryService = inject(TerritoryService);
  private router = inject(Router);
  private onlineService = inject(OnlineService);
  private activatedRoute = inject(ActivatedRoute);

  participant = this.participantService.getParticipant(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  participantForm = this.formBuilder.group({
    id: this.participant.id,
    name: [{ value: this.participant.name, disabled: true }, Validators.required]
  });

  onSubmit(participant: ParticipantInterface): void {
    this.participantService.deleteParticipant(participant.id);

    this.assignmentService.deleteAssignmentsByParticipant(participant.id);

    this.territoryService.returnActiveTerritoriesByParticipant(participant.id);

    //navigate to parent
    this.router.navigate(['../..'], {
      relativeTo: this.activatedRoute
    });
  }
}
