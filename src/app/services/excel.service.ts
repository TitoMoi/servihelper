import { Injectable } from "@angular/core";
import { TranslocoLocaleService } from "@ngneat/transloco-locale";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ConfigService } from "app/config/service/config.service";
import * as ExcelJS from "exceljs";

import { AssignmentGroupInterface } from "../assignment/model/assignment.model";

@Injectable({
  providedIn: "root",
})
export class ExcelService {
  private sheet!: ExcelJS.Worksheet;
  constructor(
    private configService: ConfigService,
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
        width: 0,
        height: 0,
        firstSheet: 0,
        activeTab: 1,
        visibility: "visible",
      },
    ];
    return workbook;
  }

  private addSheetA4AndPortrait(workbook: ExcelJS.Workbook): ExcelJS.Worksheet {
    // create new sheet with pageSetup settings for A4 - landscape
    const worksheet = workbook.addWorksheet("Hoja1", {
      pageSetup: { paperSize: 9, orientation: "portrait" },
    });
    return worksheet;
  }

  private addSheetA4AndLandscape(
    workbook: ExcelJS.Workbook
  ): ExcelJS.Worksheet {
    // create new sheet with pageSetup settings for A4 - landscape
    const worksheet = workbook.addWorksheet("Hoja1", {
      pageSetup: { paperSize: 9, orientation: "landscape" },
    });
    return worksheet;
  }

  private addAssignmentsToSheetVertical(ags: AssignmentGroupInterface[]) {
    ags.forEach((ag) => {
      //date
      const row = this.sheet.addRow({});
      const cell = row.getCell(1);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: this.configService
            .getConfig()
            .defaultReportDateColor.substring(1),
        }, //remove #
      };

      cell.font = {
        size:
          Number(this.configService.getConfig().defaultReportFontSize) || 16,
      };

      cell.value = this.translocoLocaleService.localizeDate(
        ag.date,
        undefined,
        { dateStyle: this.configService.getConfig().defaultReportDateFormat }
      );

      //assign type titles
      ag.assignments.forEach((a) => {
        const row = this.sheet.addRow({});
        const cell = row.getCell(1);

        cell.font = {
          bold: true,
          size:
            Number(this.configService.getConfig().defaultReportFontSize) || 16,
        };

        const color = this.assignTypeService
          .getAssignTypeByName(a.assignType)
          .color?.substring(1);

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: color,
          },
        };

        cell.value = a.theme ? a.theme : a.assignType;

        //participants
        /*  const row2 = this.sheet.addRow({}); */
        const cell2 = row.getCell(2);

        cell2.font = {
          size:
            Number(this.configService.getConfig().defaultReportFontSize) || 16,
        };

        cell2.value = a.principal;
        if (a.assistant) cell2.value += " / " + "\n" + a.assistant;
      });
    });
  }

  private addAssignmentsToSheetHorizontal(ags: AssignmentGroupInterface[]) {
    ags.forEach((ag) => {
      //date
      let row = this.sheet.addRow({});
      const cell = row.getCell(1);

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: this.configService
            .getConfig()
            .defaultReportDateColor.substring(1),
        },
      };

      cell.font = {
        bold: true,
        size:
          Number(this.configService.getConfig().defaultReportFontSize) || 16,
      };

      cell.value = this.translocoLocaleService.localizeDate(
        ag.date,
        undefined,
        { dateStyle: this.configService.getConfig().defaultReportDateFormat }
      );

      //assign type titles

      let i = 2;
      ag.assignments.forEach((a) => {
        const cell = row.getCell(i);
        cell.value = a.assignType;

        const color = this.assignTypeService
          .getAssignTypeByName(a.assignType)
          .color?.substring(1);

        cell.font = {
          bold: true,
          size:
            Number(this.configService.getConfig().defaultReportFontSize) || 16,
        };

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: color,
          },
        };

        i++;
      });

      //participants
      i = 2;
      let row2 = this.sheet.addRow({});

      ag.assignments.forEach((a) => {
        const cell = row2.getCell(i);

        cell.font = {
          size:
            Number(this.configService.getConfig().defaultReportFontSize) || 16,
        };

        cell.alignment = {
          wrapText: true,
        };

        cell.value = a.principal;
        if (a.assistant) {
          cell.value += " / " + "\n" + a.assistant;
        }

        i++;
      });
    });
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
      anchor.download = "list" + ".xlsx";
      anchor.click();
    });
  }

  /**
   *
   * @param bicos the array of bicos to add in the vertical template
   */
  addAsignmentsVertical(assignmentGroups: AssignmentGroupInterface[]) {
    let workbook = this.createWorkbook();

    workbook = this.setInitialProperties(workbook);

    workbook = this.setInitialViews(workbook);

    this.sheet = this.addSheetA4AndPortrait(workbook);

    this.addAssignmentsToSheetVertical(assignmentGroups);

    this.autoSizeColumnWidth();

    /* this.sheet.views[0] = {
      showGridLines: false,
      showRowColHeaders: false,
      showRuler: false,
    }; */

    this.writeBufferToFile(workbook);
  }

  /**
   *
   * @param bicos the array of bicos to add in the horizontal template
   */
  addAsignmentsHorizontal(assignmentGroups: AssignmentGroupInterface[]) {
    let workbook = this.createWorkbook();

    workbook = this.setInitialProperties(workbook);

    workbook = this.setInitialViews(workbook);

    this.sheet = this.addSheetA4AndLandscape(workbook);

    this.addAssignmentsToSheetHorizontal(assignmentGroups);

    this.autoSizeColumnWidth();

    /* this.sheet.views[0] = {
      showGridLines: false,
      showRowColHeaders: false,
      showRuler: false,
    }; */

    this.writeBufferToFile(workbook);
  }
}
