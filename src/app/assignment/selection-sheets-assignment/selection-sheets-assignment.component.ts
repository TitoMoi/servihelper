import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ViewChild,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatOption } from "@angular/material/core";
import { MatSelect } from "@angular/material/select";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";

@Component({
  selector: "app-selection-sheets-assignment",
  templateUrl: "./selection-sheets-assignment.component.html",
  styleUrls: ["./selection-sheets-assignment.component.scss"],
})
export class SelectionSheetsAssignmentComponent implements AfterViewInit {
  assignTypes: AssignTypeInterface[] = this.assignTypesService.getAssignTypes();

  orderOptions: string[] = ["Asc", "Desc"];

  @ViewChild("assignTypesSelect") select: MatSelect;
  @ViewChild("orderSelect") order: MatSelect;

  selectionForm = new FormGroup({
    startDate: new FormControl(),
    endDate: new FormControl(),
    assignTypes: new FormControl(),
    order: new FormControl(),
  });

  constructor(
    private assignTypesService: AssignTypeService,
    private cdr: ChangeDetectorRef
  ) {}
  ngAfterViewInit(): void {
    this.select.options.forEach((item: MatOption) => item.select());
    this.order.options.first.select();
    this.cdr.detectChanges();
  }
}
