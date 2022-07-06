import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatOption } from "@angular/material/core";
import {
  MatCalendar,
  MatDatepicker,
  MatDatepickerInputEvent,
} from "@angular/material/datepicker";
import { MatSelect } from "@angular/material/select";
import { TranslocoService } from "@ngneat/transloco";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { SharedService } from "app/services/shared.service";

@Component({
  selector: "app-selection-sheets-assignment",
  templateUrl: "./report-selector.component.html",
  styleUrls: ["./report-selector.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportSelectorComponent implements AfterViewInit {
  assignTypes: AssignTypeInterface[] = this.assignTypesService.getAssignTypes();

  //Angular material datepicker hacked
  @ViewChild(MatDatepicker) picker: MatDatepicker<Date>;
  CLOSE_ON_SELECTED = false;
  init = new Date();
  selectedDates = [];
  timeoutRef;
  resetModel = new Date(0);

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

  @ViewChild("assignTypesSelect") select: MatSelect;
  @ViewChild("orderSelect") order: MatSelect;

  selectionForm = new FormGroup({
    assignTypes: new FormControl(),
    order: new FormControl(),
    template: new FormControl(),
  });

  constructor(
    private assignTypesService: AssignTypeService,
    private translocoService: TranslocoService,
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.select.options.forEach((item: MatOption) => item.select());
    this.order.options.first.select();
    this.cdr.detectChanges();
  }

  public dateClass = (date: Date) => {
    if (this.findDate(date) !== -1) {
      return ["selected"];
    }
    return [];
  };

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

      if (!this.CLOSE_ON_SELECTED) {
        const closeFn = this.picker.close;
        this.picker.close = () => {};
        this.picker[
          "_componentRef"
        ].instance._calendar.monthView._createWeekCells();

        this.timeoutRef = setTimeout(() => {
          this.picker.close = closeFn;
        });
      }
    }
  }

  public remove(date: Date): void {
    const index = this.findDate(date);
    this.selectedDates.splice(index, 1);
  }

  private findDate(date: Date): number {
    return this.selectedDates.map((m) => +m).indexOf(+date);
  }
}
