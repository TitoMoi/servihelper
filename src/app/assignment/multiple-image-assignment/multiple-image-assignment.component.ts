import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ConfigService } from "app/config/service/config.service";
import { NoteService } from "app/note/service/note.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { toPng } from "html-to-image";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
} from "@angular/core";

import { AssignmentInterface } from "../model/assignment.model";
import { AssignmentService } from "../service/assignment.service";
import { ipcRenderer } from "electron";

@Component({
  selector: "app-multiple-image-assignment",
  templateUrl: "./multiple-image-assignment.component.html",
  styleUrls: ["./multiple-image-assignment.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultipleImageAssignmentComponent implements OnChanges {
  @Input() selectedDates: Date[];
  @Input() assignTypes: string[];
  @Input() rooms: string[];
  @Input() order: string;

  #assignments: AssignmentInterface[] = [];

  assignmentsWithNames: AssignmentInterface[] = [];

  //Title bindings
  assignmentHeaderTitle = this.configService.getConfig().assignmentHeaderTitle;
  assignmentPrincipalTitle =
    this.configService.getConfig().assignmentPrincipalTitle;
  assignmentAssistantTitle =
    this.configService.getConfig().assignmentAssistantTitle;
  assignmentDateTitle = this.configService.getConfig().assignmentDateTitle;
  assignmentAssignTypeTitle =
    this.configService.getConfig().assignmentAssignTypeTitle;
  assignmentThemeTitle = this.configService.getConfig().assignmentThemeTitle;
  assignmentRoomTitle = this.configService.getConfig().assignmentRoomTitle;
  assignmentNoteTitle = this.configService.getConfig().assignmentNoteTitle;

  constructor(
    public assignTypeService: AssignTypeService,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private noteService: NoteService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(): void {
    if (this.selectedDates.length && this.assignTypes) {
      this.#assignments = [];
      this.assignmentsWithNames = [];
      this.filterAssignments().then(() => {
        this.prepareAssignmentsData();
        this.cdr.detectChanges();
      });
    }
  }

  /**
   * Filters the assignments based on the range date and assign types
   */
  async filterAssignments() {
    this.#assignments = await this.assignmentService.getAssignments();

    this.#assignments = this.#assignments.filter(
      (assignment) =>
        this.assignTypes.includes(assignment.assignType) &&
        this.rooms.includes(assignment.room) &&
        this.selectedDates.some(
          (date) =>
            new Date(date).getTime() === new Date(assignment.date).getTime()
        )
    );
  }

  /**
   * Change assignments Ids to names and data
   */
  prepareAssignmentsData() {
    this.#assignments.forEach((a) => {
      const assignmentWithData: AssignmentInterface = {
        id: a.id,
        date: a.date,
        principal: this.participantService.getParticipant(a.principal).name,
        assistant: this.participantService.getParticipant(a.assistant)?.name,
        room: this.roomService.getRoom(a.room).name,
        assignType: this.assignTypeService.getAssignType(a.assignType).name,
        footerNote: this.noteService.getNote(a.footerNote)?.editorHTML,
        theme: a.theme,
        onlyMan: undefined,
        onlyWoman: undefined,
      };
      this.assignmentsWithNames.push(assignmentWithData);
    });
  }

  async toPng() {
    //the div
    document.body.style.cursor = "wait";
    const div = document.getElementById("assignmentDiv");
    const dataUrl = await toPng(div);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.setAttribute("download", "assignments.png");
    link.click();

    document.body.style.cursor = "default";
  }

  /**
   * Send to main the creation of new window and print div
   */
  async createHiddenWindowForPrint() {
    //the div
    const div = document.getElementById("assignmentDiv");
    //create window
    await ipcRenderer.send("createHiddenWindowForPrint", {
      innerHTML: div.innerHTML,
    });
  }
}
