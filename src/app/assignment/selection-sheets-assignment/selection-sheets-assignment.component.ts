import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "app-selection-sheets-assignment",
  templateUrl: "./selection-sheets-assignment.component.html",
  styleUrls: ["./selection-sheets-assignment.component.scss"],
})
export class SelectionSheetsAssignmentComponent implements OnInit {
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  constructor() {}

  ngOnInit(): void {}
}
