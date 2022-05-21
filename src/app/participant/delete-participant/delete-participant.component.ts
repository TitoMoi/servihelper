import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { ParticipantInterface } from "app/participant/model/participant.model";
import { ParticipantService } from "app/participant/service/participant.service";

@Component({
  selector: "app-delete-participant",
  templateUrl: "./delete-participant.component.html",
  styleUrls: ["./delete-participant.component.css"],
})
export class DeleteParticipantComponent implements OnInit {
  participantForm = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const participant = this.participantService.getParticipant(
      this.activatedRoute.snapshot.params.id
    );
    this.participantForm.setValue({
      id: participant.id,
      name: participant.name,
    });
  }

  onSubmit(participant: ParticipantInterface): void {
    this.participantService.deleteParticipant(participant.id);

    this.assignmentService.deleteAssignmentsByParticipant(participant.id);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
