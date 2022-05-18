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
  participantForm;

  constructor(
    private formBuilder: FormBuilder,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.participantForm = this.formBuilder.group({
      id: undefined,
      name: [undefined, Validators.required],
    });

    this.activatedRoute.params.subscribe((params) => {
      const participant = this.participantService.getParticipant(params.id);
      this.participantForm.setValue({
        id: params.id,
        name: participant.name,
      });
    });
  }

  async onSubmit(participant: ParticipantInterface): Promise<void> {
    await this.participantService.deleteParticipant(participant.id);

    await this.assignmentService.deleteAssignmentsByParticipant(participant.id);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
