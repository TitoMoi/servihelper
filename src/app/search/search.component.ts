import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { Subscription } from "rxjs";

import { Component, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from "@angular/forms";

import { SearchResultInterface } from "./model/search.model";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule } from "@ngneat/transloco";

import { AssignTypeNamePipe } from "app/assigntype/pipe/assign-type-name.pipe";

@Component({
    selector: "app-search",
    templateUrl: "./search.component.html",
    styleUrls: ["./search.component.scss"],
    imports: [
        TranslocoModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        RouterLink,
        TranslocoLocaleModule,
        AssignTypeNamePipe,
    ]
})
export class SearchComponent implements OnInit, OnDestroy {
  searchForm: UntypedFormGroup;
  participants: ParticipantInterface[];
  assignments: AssignmentInterface[];
  results: SearchResultInterface[];
  isPrincipal: boolean;
  participantSub$: Subscription;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private assignTypeService: AssignTypeService,
    private roomService: RoomService,
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
        assignment.principal === participantId ? "SEARCH_YES" : "SEARCH_NO";

      this.results.push({
        isPrincipalResult: isPrincipalLiteral,
        assignTypeName: this.assignTypeService.getNameOrTranslation(assignType),
        date: new Date(assignment.date),
        roomName: this.roomService.getNameOrTranslation(room),
      });
    }
  }
}
