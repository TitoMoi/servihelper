import { Component, OnInit } from "@angular/core";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { ConfigService } from "app/config/service/config.service";
import { NoteService } from "app/note/service/note.service";
import { RoomService } from "app/room/service/room.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  configFileLoaded: boolean;

  constructor(
    private configService: ConfigService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private noteService: NoteService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService
  ) {
    this.configFileLoaded = false;
  }
  async ngOnInit(): Promise<void> {
    this.configFileLoaded = await this.configService.ensureConfigFile();
    this.roomService.ensureRoomFile();
    this.assignTypeService.ensureAssignTypeFile();
    this.noteService.ensureNoteFile();
    this.participantService.ensureParticipantFile();
    this.assignmentService.ensureAssignmentFile();
  }
}
