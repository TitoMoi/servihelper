import { AssignmentInterface } from 'app/assignment/model/assignment.model';
import { AssignmentService } from 'app/assignment/service/assignment.service';
import { AssignTypeService } from 'app/assignType/service/assignType.service';
import { ParticipantInterface } from 'app/participant/model/participant.model';
import { ParticipantService } from 'app/participant/service/participant.service';
import { RoomService } from 'app/room/service/room.service';
import { Subscription } from 'rxjs';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { SearchResultInterface } from './model/search.model';

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  participants: ParticipantInterface[];
  assignments: AssignmentInterface[];
  results: SearchResultInterface[];
  isPrincipal: boolean;
  participantSub$: Subscription;
  constructor(
    private formBuilder: FormBuilder,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private assignTypeService: AssignTypeService,
    private roomService: RoomService
  ) {
    this.searchForm = this.formBuilder.group({
      participant: [undefined],
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

    this.participantSub$ = this.searchForm.valueChanges.subscribe((values) => {
      const participant = values.participant;

      this.assignments = this.assignmentService.findAssignmentsByParticipantId(
        participant.id
      );

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
      const assignType = this.assignTypeService.getAssignType(
        assignment.assignType
      );
      const room = this.roomService.getRoom(assignment.room);
      const isPrincipalLiteral =
        assignment.principal === participantId ? "SEARCH_YES" : "SEARCH_NO";

      this.results.push({
        isPrincipalResult: isPrincipalLiteral,
        assignTypeName: assignType.name,
        date: new Date(assignment.date),
        roomName: room.name,
      });
    }
  }
}
