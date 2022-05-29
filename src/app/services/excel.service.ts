import { Injectable } from "@angular/core";
import { TranslocoLocaleService } from "@ngneat/transloco-locale";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import * as ExcelJS from "exceljs";

import {
  AssignmentGroupInterface,
  AssignmentInterface,
} from "../assignment/model/assignment.model";
import { ParticipantService } from "../participant/service/participant.service";

@Injectable({
  providedIn: "root",
})
export class ExcelService {
  private sheet!: ExcelJS.Worksheet;
  constructor(
    private participantService: ParticipantService,
    private translocoLocaleService: TranslocoLocaleService,
    private assignTypeService: AssignTypeService
  ) {}

  private createWorkbook(): ExcelJS.Workbook {
    return new ExcelJS.Workbook();
  }

  private setInitialProperties(workbook: ExcelJS.Workbook) {
    workbook.creator = "Moisés Medina";
    workbook.lastModifiedBy = "Moisés Medina";
    workbook.created = new Date(Date.now());
    workbook.modified = new Date();
    workbook.lastPrinted = new Date(Date.now());
    return workbook;
  }

  private setInitialViews(workbook: ExcelJS.Workbook) {
    workbook.views = [
      {
        x: 0,
        y: 0,
        width: 10000,
        height: 20000,
        firstSheet: 0,
        activeTab: 1,
        visibility: "visible",
      },
    ];
    return workbook;
  }

  private addSheet(workbook: ExcelJS.Workbook): ExcelJS.Worksheet {
    return workbook.addWorksheet("Hoja1");
  }

  private addSheetA4AndPortrait(workbook: ExcelJS.Workbook): ExcelJS.Worksheet {
    // create new sheet with pageSetup settings for A4 - landscape
    const worksheet = workbook.addWorksheet("Hoja1", {
      pageSetup: { paperSize: 9, orientation: "landscape" },
    });
    return worksheet;
  }

  /* 
  <div class="row white-base-background" *ngFor="let ag of assignmentGroup">
    <div class="col-12 mb-2 bold double-font bg-color-lightskyblue">
      {{ ag.date | translocoDate: { dateStyle: "long" } }}
    </div>
    <div *ngFor="let assignment of ag.assignments" class="col-12 mb-1">
      <div class="row justify-content-center">
        <div class="col-12 bold increase-font">
          {{ assignment.theme }}
          <span *ngIf="!assignment.theme">{{ assignment.assignType }}</span>
        </div>
        <div class="col-11 mb-1 increase-font">
          • {{ assignment.principal }}
          <span *ngIf="assignment.assistant">/ {{ assignment.assistant }}</span>
        </div>
      </div>
    </div>
  </div>
   */

  private addAssignmentsToSheet(
    ags: AssignmentGroupInterface[],
    assignments: AssignmentInterface[]
  ) {
    ags.forEach((ag) => {
      const row = this.sheet.addRow({});
      const cell = row.getCell(1);
      cell.value = this.translocoLocaleService.localizeDate(
        ag.date,
        undefined,
        { dateStyle: "long" }
      );

      assignments.forEach((a) => {
        const row = this.sheet.addRow({});
        const cell = row.getCell(1);
        cell.value = a.theme
          ? a.theme
          : this.assignTypeService.getAssignType(a.assignType).name;
        const row2 = this.sheet.addRow({});
        const cell2 = row2.getCell(1);
        cell2.value = this.participantService.getParticipant(a.principal).name;
        if (a.assistant)
          cell2.value +=
            "/" + this.participantService.getParticipant(a.assistant).name;
      });
    });
  }

  /**
   * dark blue foreground with white text
   */
  private addHeaderModel1() {
    const firstRow = this.sheet.addRow({});
    const cell = firstRow.getCell(1);
    cell.value = "TERRITORI";
    cell.style = {
      font: {
        size: 24,
        bold: true,
        color: { argb: "FFFFFFFF" },
        name: "arial",
      },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "0b5394" },
      },
      alignment: {
        horizontal: "center",
      },
    };
  }

  mergeCells(from: string, to: string) {
    this.sheet.mergeCells(from + ":" + to);
  }

  autoSizeColumnWidth() {
    this.sheet.columns.forEach((column) => {
      const lengths = column.values!.map((v) => v!.toString().length);
      const maxLength = Math.max(
        ...lengths.filter((v) => typeof v === "number")
      );
      column.width = maxLength;
    });
  }

  writeBufferToFile(workbook: ExcelJS.Workbook) {
    workbook.xlsx.writeBuffer().then((file) => {
      let blob = new Blob([file], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const anchor = document.createElement("a");
      const url = URL.createObjectURL(blob);
      anchor.href = url;
      anchor.download = "catastro" + ".xlsx";
      anchor.click();
    });
  }

  /**
   *
   * @param bicos the array of bicos to add in the model1
   */
  addAsignments(
    assignmentGroups: AssignmentGroupInterface[],
    assignments: AssignmentInterface[]
  ) {
    let workbook = this.createWorkbook();

    workbook = this.setInitialProperties(workbook);

    workbook = this.setInitialViews(workbook);

    this.sheet = this.addSheetA4AndPortrait(workbook);

    this.addAssignmentsToSheet(assignmentGroups, assignments);

    this.autoSizeColumnWidth();

    this.writeBufferToFile(workbook);
  }
}
