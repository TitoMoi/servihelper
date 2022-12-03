import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { RoomInterface } from "app/room/model/room.model";
import { RoomService } from "app/room/service/room.service";
import { SharedService } from "app/services/shared.service";

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatLegacyOption as MatOption } from "@angular/material/legacy-core";
import {
  MatDatepicker,
  MatDatepickerInputEvent,
} from "@angular/material/datepicker";
import { MatLegacySelect as MatSelect } from "@angular/material/legacy-select";
import { TranslocoService } from "@ngneat/transloco";

@Component({
  selector: "app-report-selector",
  templateUrl: "./report-selector.component.html",
  styleUrls: ["./report-selector.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportSelectorComponent implements OnInit, AfterViewInit {
  //Angular material datepicker hacked
  @ViewChild(MatDatepicker) datePickerRef: MatDatepicker<Date>;
  @ViewChild("assignTypesSelect") assignTypesSelectRef: MatSelect;
  @ViewChild("roomsSelect") roomsSelectRef: MatSelect;
  @ViewChild("orderSelect") order: MatSelect;

  rooms: RoomInterface[] = this.roomService
    .getRooms()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  //props for datepicker hack
  closeOnSelected = false;
  init = new Date();
  selectedDates = [];
  timeoutRef;
  resetModel = undefined;

  orderOptions: string[] = ["Asc", "Desc"];

  templateOptions: string[] = [
    this.translocoService.translate(
      "ASSIGN_SELECTION_ASSIGNTYPES_TEMPLATE_VERTICAL"
    ),
    this.translocoService.translate(
      "ASSIGN_SELECTION_ASSIGNTYPES_TEMPLATE_HORIZONTAL"
    ),
    this.translocoService.translate(
      "ASSIGN_SELECTION_ASSIGNTYPES_TEMPLATE_MULTIPLE_SHEET"
    ),
  ];

  selectionForm: UntypedFormGroup = this.formBuilder.group({
    dates: [undefined, Validators.required],
    rooms: [undefined, Validators.required],
    assignTypes: [undefined, Validators.required],
    order: [undefined, Validators.required],
    template: [undefined, Validators.required],
  });

  constructor(
    private assignTypeService: AssignTypeService,
    private roomService: RoomService,
    private translocoService: TranslocoService,
    private sharedService: SharedService,
    private formBuilder: UntypedFormBuilder,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.selectionForm.markAllAsTouched();
  }

  ngAfterViewInit() {
    this.assignTypesSelectRef.options.forEach((item: MatOption) =>
      item.select()
    );

    this.roomsSelectRef.options.forEach((item: MatOption) => item.select());
    this.order.options.first.select();
    this.cdr.detectChanges();
  }

  //for Datepicker hack
  public dateClass = (date: Date) => {
    if (this.findDate(date) !== -1) {
      return ["selected"];
    }
    return [];
  };

  //for Datepicker hack
  public dateChanged(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      const date = event.value;
      const index = this.findDate(date);
      if (index === -1) {
        this.selectedDates.push(date);
      } else {
        this.selectedDates.splice(index, 1);
      }
      this.resetModel = new Date(0);
      //prepare sorted dates for the reports and new reference for the input components
      this.selectedDates = [
        ...this.selectedDates.sort(this.sharedService.sortDates),
      ];

      if (!this.closeOnSelected) {
        const closeFn = this.datePickerRef.close;
        this.datePickerRef.close = () => {};
        // eslint-disable-next-line no-underscore-dangle
        this.datePickerRef[
          // eslint-disable-next-line @typescript-eslint/dot-notation
          "_componentRef"
        ].instance._calendar.monthView._createWeekCells();

        this.timeoutRef = setTimeout(() => {
          this.datePickerRef.close = closeFn;
        });
      }
    }
  }

  //for Datepicker hack
  public remove(date: Date): void {
    const index = this.findDate(date);
    this.selectedDates.splice(index, 1);
  }

  //for Datepicker hack
  private findDate(date: Date): number {
    return this.selectedDates.map((m) => +m).indexOf(+date);
  }
}
