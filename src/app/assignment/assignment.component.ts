import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";
import {
  AssignmentInterface,
  AssignmentTableInterface,
} from "app/assignment/model/assignment.model";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { MyCustomPaginatorI18 } from "app/services/my-custom-paginator-i18.service";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { RoomInterface } from "app/room/model/room.model";

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  //In memory assignments
  assignments: AssignmentInterface[];

  //Table
  displayedColumns: string[] = [
    "assignImage",
    "date",
    "principal",
    "assistant",
    "assignType",
    "room",
    "editIcon",
    "deleteIcon",
  ];
  //Datasource
  dataSource: AssignmentTableInterface[] = [];
  //Expanded element
  expandedElement: AssignmentInterface | null;

  pageIndex = 0;
  itemsPerPage = 20;

  rows: NodeListOf<Element> = undefined;

  observer: IntersectionObserver = new IntersectionObserver((entries) => {
    //Always observe the last row, forEach only has 1 entry
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        //Virtual pagination
        this.pageIndex = this.pageIndex + 1;
        const begin = this.pageIndex * this.itemsPerPage;
        const end = begin + this.itemsPerPage;
        const assignmentsPage = this.assignments.slice(begin, end);

        this.dataSource = [
          ...this.dataSource,
          ...this.fillDataSource(assignmentsPage),
        ];
        this.observer.unobserve(entry.target);
        this.cdr.detectChanges();
      }
    });
  });

  constructor(
    private assignmentService: AssignmentService,
    private participantService: ParticipantService,
    private roomService: RoomService,
    private assignTypeService: AssignTypeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.assignments = this.assignmentService.getAssignments();

    //Initial pagination
    const begin = this.pageIndex * this.itemsPerPage;
    const end = begin + this.itemsPerPage;
    const assignmentsPage = this.assignments.slice(begin, end);
    this.dataSource = this.fillDataSource(assignmentsPage);
  }

  ngAfterViewChecked(): void {
    this.queryAllMatRows();

    //Multiply by 2 because each assignment has two rows, the "theme row" is hidden
    if (this.rows.length !== this.assignments.length * 2)
      this.observer.observe(this.rows[this.rows.length - 1]);
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }

  queryAllMatRows() {
    this.rows = document.querySelectorAll(".mat-row");
  }

  trackByIdFn(index, assignment: AssignmentTableInterface) {
    return assignment.id;
  }

  fillDataSource(
    assignmentsPage: AssignmentInterface[]
  ): AssignmentTableInterface[] {
    const assignmentsTable: AssignmentTableInterface[] = [];

    //Diferent sort, first separate date into arrays, then double sort first room and then assign type
    let assignmentsByDate: [AssignmentInterface[]] = [[]];
    let index = 0;
    let lastDate = assignmentsPage[0]?.date;

    assignmentsPage.forEach((assignment) => {
      if (
        new Date(assignment.date).getTime() === new Date(lastDate).getTime()
      ) {
        assignmentsByDate[index].push(assignment);
      } else {
        lastDate = assignment.date;
        index = index + 1;
        assignmentsByDate.push([]);
        assignmentsByDate[index].push(assignment);
      }
    });

    assignmentsByDate.forEach((assignGroupByDate: AssignmentInterface[]) => {
      assignGroupByDate = assignGroupByDate.sort(
        (a: AssignmentInterface, b: AssignmentInterface) => {
          const assignTypeAOrder = this.assignTypeService.getAssignType(
            a.assignType
          ).order;
          const assignTypeBOrder = this.assignTypeService.getAssignType(
            b.assignType
          ).order;
          const roomAOrder = this.roomService.getRoom(a.room).order;
          const roomBOrder = this.roomService.getRoom(b.room).order;

          if (roomAOrder === roomBOrder) {
            if (assignTypeAOrder === assignTypeBOrder) return 0;
            return assignTypeAOrder > assignTypeBOrder ? 1 : -1;
          } else {
            return roomAOrder > roomBOrder ? 1 : -1;
          }
        }
      );
    });

    const assignmentsSorted = assignmentsByDate.flat();

    for (const assignment of assignmentsSorted) {
      //assistant is optional
      const assistant = this.participantService.getParticipant(
        assignment.assistant
      );

      const assignType = this.assignTypeService.getAssignType(
        assignment.assignType
      );

      //Populate datasource, values are in order
      assignmentsTable.push({
        id: assignment.id,
        date: assignment.date,
        hasDateSeparator: undefined,
        room: this.roomService.getRoom(assignment.room).name,
        assignType: assignType.name,
        assignTypeColor: assignType.color,
        theme: assignment.theme,
        principal: this.participantService.getParticipant(assignment.principal)
          .name,
        assistant: assistant ? assistant.name : undefined,
      });
    }

    //Separate dates from one day to another with a black border
    let filteredLastDate: Date = assignmentsTable[0]?.date;
    assignmentsTable.forEach((tableRow: AssignmentTableInterface) => {
      if (
        new Date(tableRow.date).getTime() !==
        new Date(filteredLastDate).getTime()
      ) {
        tableRow.hasDateSeparator = true;
        filteredLastDate = tableRow.date;
      }
    });

    //Update the view
    return assignmentsTable;
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
