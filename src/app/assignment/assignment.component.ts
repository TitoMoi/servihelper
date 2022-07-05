import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { MatPaginatorIntl, PageEvent } from "@angular/material/paginator";
import { DomSanitizer } from "@angular/platform-browser";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import {
  AssignmentInterface,
  AssignmentTableInterface,
} from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { TranslocoService } from "@ngneat/transloco";
import { DateAdapter } from "@angular/material/core";
import { MyCustomPaginatorI18 } from "app/services/my-custom-paginator-i18.service";

@Component({
  selector: "app-assignment",
  templateUrl: "./assignment.component.html",
  styleUrls: ["./assignment.component.scss"],
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorI18 }],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class AssignmentComponent implements OnInit {
  //In memory assignments
  assignments: AssignmentInterface[];
  //Pagination
  pageSizeOptions: number[] = [10, 15, 30];
  //Table
  displayedColumns: string[] = [
    "assignImage",
    "date",
    "principal",
    "assistant",
    "room",
    "assignType",
    "editIcon",
    "deleteIcon",
  ];
  //Datasource
  dataSource: AssignmentTableInterface[] = [];
  //Expanded element
  expandedElement: AssignmentInterface | null;

  constructor(
    private assignmentService: AssignmentService,
    private participantService: ParticipantService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private translocoService: TranslocoService,
    private dateAdapter: DateAdapter<Date>
  ) {}

  ngOnInit() {
    //ToDo: No queda claro, getLang...pero pongo un locale despues.
    //Set datepicker lang to locale
    const lang = this.translocoService.getActiveLang();
    this.dateAdapter.setLocale(lang);

    this.assignments = this.assignmentService.getAssignments();

    //ToDo: Que lo de el servicio ya paginado.
    const begin = 0 * this.pageSizeOptions[0];
    const end = begin + this.pageSizeOptions[0];
    const assignmentsPage = this.assignments.slice(begin, end);
    this.fillDataSource(assignmentsPage);
  }

  trackByIdFn(index, assignment: AssignmentInterface) {
    return assignment.id;
  }

  handlePageEvent(pageEvent: PageEvent) {
    //ToDo: Codigo duplicado, que lo de el servicio ya paginado.
    const begin = pageEvent.pageIndex * pageEvent.pageSize;
    const end = begin + pageEvent.pageSize;
    const assignmentsPage = this.assignments.slice(begin, end);
    this.fillDataSource(assignmentsPage);
  }

  fillDataSource(assignmentsPage: AssignmentInterface[]) {
    const dataSourceTemp: AssignmentTableInterface[] = [];
    for (const assignment of assignmentsPage) {
      //assistant is optional
      const assistant = this.participantService.getParticipant(
        assignment.assistant
      );

      //Populate datasource, values are in order
      dataSourceTemp.push({
        id: assignment.id,
        date: assignment.date,
        room: this.roomService.getRoom(assignment.room).name,
        assignType: this.assignTypeService.getAssignType(assignment.assignType)
          .name,
        theme: assignment.theme,
        principal: this.participantService.getParticipant(assignment.principal)
          .name,
        assistant: assistant ? assistant.name : undefined,
      });
    }
    //Update the view
    this.dataSource = dataSourceTemp;
  }

  exportCsv() {
    let data = "";
    let headers = "";
    const rows = [];
    const keys = Object.keys(this.dataSource[0]);
    for (const key of keys) {
      headers = headers + key + ";";
    }
    headers = headers + "\n";
    rows.push(headers);

    for (const assign of this.dataSource) {
      data = ""; //reset row
      for (const key of keys) {
        data = data + assign[key] + ";";
      }
      data = data + "\n";
      rows.push(data);
    }
    const a: any = document.createElement("a");
    const file = new Blob(rows, { type: "text/csv" });
    a.href = URL.createObjectURL(file);
    a.download = "assignments.csv";
    a.click();
  }
}
