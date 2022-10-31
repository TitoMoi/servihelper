import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";
import { Validators } from "ngx-editor";
import { ParticipantInterface } from "../model/participant.model";
import { ParticipantService } from "../service/participant.service";

@Component({
  selector: "app-create-from-participant",
  templateUrl: "./create-from-participant.component.html",
  styleUrls: ["./create-from-participant.component.scss"],
})
export class CreateFromParticipantComponent implements OnInit {
  participants: ParticipantInterface[] =
    this.participantService.getParticipants(true);

  participantForm = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
    principal: [undefined, Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private participantService: ParticipantService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  createParticipant() {}
  onSubmit(): void {
    const participantId = this.participantForm.get("principal").value;

    const participant: ParticipantInterface = structuredClone(
      this.participantService.getParticipant(participantId)
    );

    //Reset some properties
    participant.id = undefined;
    participant.notAvailableDates = [];

    //Add the name
    participant.name = this.participantForm.get("name").value;

    this.participantService.createParticipant(participant);

    //navigate to parent
    this.router.navigate([".."], {
      relativeTo: this.activatedRoute,
    });
  }
}
