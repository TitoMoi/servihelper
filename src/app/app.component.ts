import { Component, OnInit } from "@angular/core";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ConfigService } from "app/config/service/config.service";
import { NoteService } from "app/note/service/note.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  filesExist: boolean;

  constructor(
    private configService: ConfigService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private noteService: NoteService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService
  ) {
    this.filesExist = false;
  }
  ngOnInit() {
    Promise.all([
      this.roomService.ensureRoomFile(),
      this.assignTypeService.ensureAssignTypeFile(),
      this.noteService.ensureNoteFile(),
      this.participantService.ensureParticipantFile(),
      this.assignmentService.ensureAssignmentFile(),
      this.configService.ensureConfigFile(),
    ]).then(() => {
      this.configService.getConfig();
      this.roomService.getRooms();
      this.assignTypeService.getAssignTypes();
      this.noteService.getNotes();
      this.participantService.getParticipants();
      this.assignmentService.getAssignments();
      this.filesExist = true;
    });
  }
}
