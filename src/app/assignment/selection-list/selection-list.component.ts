import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import { ElectronService } from "app/services/electron.service";
import { toPng } from "html-to-image";
import {
  AssignmentGroupInterface,
  AssignmentInterface,
} from "../model/assignment.model";
import { AssignmentService } from "../service/assignment.service";
import { ExcelService } from "app/services/excel.service";

@Component({
  selector: "app-selection-list",
  templateUrl: "./selection-list.component.html",
  styleUrls: ["./selection-list.component.scss"],
})
export class SelectionListComponent implements OnChanges {
  @Input("startDate") startDate: Date;
  @Input("endDate") endDate: Date;
  @Input("assignTypes") assignTypes: string[];
  @Input("order") order: string;

  #assignments: AssignmentInterface[] = [];

  assignmentGroups: AssignmentGroupInterface[] = [];

  icons: string[] = ["pdf", "excel"];

  constructor(
    private assignTypeService: AssignTypeService,
    private roomService: RoomService,
    private participantService: ParticipantService,
    private assignmentService: AssignmentService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private excelService: ExcelService,
    private electronService: ElectronService
  ) {
    //Register icons
    for (const iconFileName of this.icons) {
      this.matIconRegistry.addSvgIcon(
        iconFileName,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          "assets/icons/" + iconFileName + ".svg"
        )
      );
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.startDate && this.endDate && this.assignTypes) {
      this.#assignments = [];
      this.assignmentGroups = [];
      this.filterAssignments();
      this.sortAssignmentByDate(this.order);
      this.getRelatedData();
      this.sortAssignmentByAssignTypeOrder();
    }
  }

  ngOnInit(): void {}

  /**
   * Filters the assignments based on the range date and assign types
   */
  filterAssignments() {
    this.#assignments = this.assignmentService
      .getAssignments(true)
      .filter((assignment) => this.assignTypes.includes(assignment.assignType))
      .filter(
        (assignment) =>
          new Date(assignment.date) >= new Date(this.startDate) &&
          new Date(assignment.date) <= new Date(this.endDate)
      );
  }

  sortAssignmentByDate(order: string) {
    if (order === "Desc") {
      this.#assignments = this.#assignments.sort(
        this.assignmentService.sortAssignmentsByDateDesc
      );
      return;
    }
    this.#assignments = this.#assignments.sort(
      this.assignmentService.sortAssignmentsByDateAsc
    );
  }

  sortAssignmentByAssignTypeOrder() {
    for (let ag of this.assignmentGroups) {
      ag.assignments.sort(
        (a: AssignmentInterface, b: AssignmentInterface): number => {
          const orderA = this.assignTypeService.getAssignTypeByName(
            a.assignType
          ).order;
          const orderB = this.assignTypeService.getAssignTypeByName(
            b.assignType
          ).order;

          if (orderA > orderB) {
            return 1;
          }
          if (orderA < orderB) {
            return -1;
          }
          return 0;
        }
      );
    }
  }

  /**
   * Covert the id's to names
   */
  getRelatedData() {
    let assignGroup: AssignmentGroupInterface = {
      date: undefined,
      assignments: [],
    };

    let length = this.#assignments.length;

    for (let assignment of this.#assignments) {
      --length;

      if (!assignGroup.date) assignGroup.date = assignment.date;

      if (assignGroup.date !== assignment.date) {
        //save and reset
        this.assignmentGroups.push(assignGroup);
        assignGroup = { date: assignment.date, assignments: [] };
      }

      assignGroup.assignments.push({
        id: assignment.id,
        date: assignment.date,
        room: this.roomService.getRoom(assignment.room).name,
        assignType: this.assignTypeService.getAssignType(assignment.assignType)
          .name,
        theme: assignment.theme,
        onlyWoman: false,
        onlyMan: false,
        principal: this.participantService.getParticipant(assignment.principal)
          .name,
        assistant: this.participantService.getParticipant(assignment.assistant)
          ?.name,
        footerNote: "",
      });

      if (!length) this.assignmentGroups.push(assignGroup);
    }
  }

  async toPdf() {
    /* const micronMeasure = 132.2816; */
    const micronMeasure = 160.2816;
    //the div
    document.body.style.cursor = "wait";
    const div = document.getElementById("resultListDiv");
    const dataUrl = await toPng(div);

    //create window
    const win = new this.electronService.remote.BrowserWindow({
      width: div.offsetWidth,
      height: div.offsetHeight,
      show: false,
    });

    await win.loadURL(dataUrl);

    const pdfOptions = {
      marginsType: 1,
      pageSize: {
        width: div.offsetWidth * micronMeasure,
        height: div.offsetHeight * micronMeasure * 1.05, //1px = 264.5833 microns (meassure units)
      },
      printBackground: false,
      printSelectionOnly: false,
      landscape: false,
    };

    win.webContents.printToPDF(pdfOptions).then((data) => {
      const blob = new Blob([data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", "list.pdf");
      link.click();
    });
    document.body.style.cursor = "default";
  }

  async toExcel() {
    this.excelService.addAsignments(this.assignmentGroups, this.#assignments);
  }
}
