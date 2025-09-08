import { AssignmentInterface } from 'app/assignment/model/assignment.model';
import { AssignmentService } from 'app/assignment/service/assignment.service';
import { AssignTypeService } from 'app/assigntype/service/assigntype.service';
import { ParticipantInterface } from 'app/participant/model/participant.model';
import { ParticipantService } from 'app/participant/service/participant.service';
import { RoomService } from 'app/room/service/room.service';
import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { TranslocoLocaleModule } from '@jsverse/transloco-locale';
import { SearchResultInterface } from './model/search.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    RouterLink,
    TranslocoLocaleModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit, OnDestroy {
  private formBuilder = inject(UntypedFormBuilder);
  private participantService = inject(ParticipantService);
  private assignmentService = inject(AssignmentService);
  private assignTypeService = inject(AssignTypeService);
  private roomService = inject(RoomService);

  searchForm: UntypedFormGroup;
  participants: ParticipantInterface[];
  assignments: AssignmentInterface[];
  results: SearchResultInterface[];
  isPrincipal: boolean;
  participantSub$: Subscription;
  constructor() {
    this.searchForm = this.formBuilder.group({
      participant: [undefined]
    });
    this.isPrincipal = false;
    this.participants = [];
    this.assignments = [];
    this.results = [];
  }
  ngOnDestroy(): void {
    this.participantSub$.unsubscribe();
  }

  ngOnInit(): void {
    this.participants = this.participantService.getParticipants();

    this.participantSub$ = this.searchForm.valueChanges.subscribe(values => {
      const participant = values.participant;

      this.assignments = this.assignmentService.findAssignmentsByParticipantId(participant.id);

      this.calculateSearchResult(participant.id);
    });
  }

  /**
   *
   * @param participantId the id of the participant
   */
  calculateSearchResult(participantId: string) {
    this.results = [];

    for (const assignment of this.assignments) {
      const assignType = this.assignTypeService.getAssignType(assignment.assignType);
      const room = this.roomService.getRoom(assignment.room);
      const isPrincipalLiteral =
        assignment.principal === participantId ? 'SEARCH_YES' : 'SEARCH_NO';

      this.results.push({
        isPrincipalResult: isPrincipalLiteral,
        assignTypeName: this.assignTypeService.getNameOrTranslation(assignType),
        date: new Date(assignment.date),
        roomName: this.roomService.getNameOrTranslation(room)
      });
    }
  }
}
