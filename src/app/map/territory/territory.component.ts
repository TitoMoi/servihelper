/* eslint-disable complexity */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoModule, TranslocoService } from "@ngneat/transloco";
import { TerritoryContextClass, TerritoryContextInterface } from "../model/map.model";
import { TerritoryService } from "./service/territory.service";
import { MatCheckboxChange, MatCheckboxModule } from "@angular/material/checkbox";
import { MatExpansionModule } from "@angular/material/expansion";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { TerritoryGroupService } from "../territory-group/service/territory-group.service";
import { ParticipantPipe } from "app/participant/pipe/participant.pipe";
import { MatTooltipModule } from "@angular/material/tooltip";
import { PolygonService } from "./service/polygon.service";
import { clipboard, shell } from "electron";
import { OnlineService } from "app/online/service/online.service";
import { PdfService } from "app/services/pdf.service";
import path from "path";
import { ConfigService } from "app/config/service/config.service";
import { ensureFileSync, readFileSync, removeSync, writeFile } from "fs-extra";
import { filenamifyPath } from "filenamify";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { SortService } from "app/services/sort.service";

@Component({
  selector: "app-territory",
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatExpansionModule,
    MatCheckboxModule,
    TranslocoLocaleModule,
    ParticipantPipe,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./territory.component.html",
  styleUrls: ["./territory.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerritoryComponent {
  territories: TerritoryContextClass[] = this.territoryService
    .getTerritories()
    .sort((a, b) => (a.name > b.name ? 1 : -1));
  territoryGroups = this.territoryGroupService
    .getTerritoryGroups()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  territoriesInFolderCreated = false;
  showSpinner = false;

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  constructor(
    private territoryService: TerritoryService,
    private territoryGroupService: TerritoryGroupService,
    private polygonService: PolygonService,
    private onlineService: OnlineService,
    private pdfService: PdfService,
    private translocoService: TranslocoService,
    private configService: ConfigService,
    private sortService: SortService,
    private cdr: ChangeDetectorRef,
  ) {}

  getLengthForGroup(tgId: string) {
    let count = 0;
    for (let i = 0; i < this.territories.length; i++) {
      if (this.territories[i].groups.includes(tgId)) count++;
    }
    return count;
  }

  getUrlWithPolygonParams(t: TerritoryContextInterface) {
    const servihelperMapUrl = new URL("https://titomoi.github.io/servihelper");
    servihelperMapUrl.searchParams.append(
      "polygon",
      JSON.stringify(this.polygonService.getPolygon(t.poligonId).latLngList),
    );
    return servihelperMapUrl;
  }

  generateMapLink(t: TerritoryContextInterface, matIcon: MatIcon) {
    matIcon.svgIcon = "clipboard";
    this.cdr.detectChanges();
    document.body.style.cursor = "wait";
    const url = this.getUrlWithPolygonParams(t);
    clipboard.write(
      {
        text: url.toString(),
      },
      "selection",
    );
    document.body.style.cursor = "default";
    setTimeout(() => {
      matIcon.svgIcon = "maplink";
      this.cdr.detectChanges();
    }, 500);
  }

  getPdfSheet() {
    return this.pdfService.getJsPdf({
      orientation: "portrait",
      format: "a4",
    });
  }

  /**
   * Generate all the territory pdf files
   */
  async toMultiplePdf() {
    this.showSpinner = true;
    this.territoriesInFolderCreated = false;
    //Clean directory "territories" first
    removeSync(filenamifyPath(path.join(this.configService.homeDir, "territories")));
    const promises = [];
    for (const t of this.territories.filter((terr) => terr.available)) {
      const pdfBytes = this.toPdf(t, false);

      for (const g of t.groups) {
        // Get the territory group name
        const tg = this.territoryGroupService.getTerritoryGroup(g);
        //Get the filename path and ensure it's valid for the system
        const fileNamePath = filenamifyPath(
          path.join(this.configService.homeDir, "territories", tg.name, t.name + ".pdf"),
        );
        ensureFileSync(fileNamePath);
        promises.push(writeFile(fileNamePath, new Uint8Array(await pdfBytes.arrayBuffer())));
      }
    }
    await Promise.all([...promises]);
    this.territoriesInFolderCreated = true;
    this.showSpinner = false;
    this.cdr.detectChanges();
  }

  /** Generates a territory pdf, if save is true shows a dialog to save the file, otherwise returns the blob pdfBytes */
  toPdf(t: TerritoryContextInterface, save = true): Blob {
    const doc = this.getPdfSheet();
    doc.setFont(this.pdfService.font, "bold");

    const x = this.pdfService.getInitialWidth();
    let y = this.pdfService.getInitialHeight();

    doc.setFontSize(14);
    doc.text(t.name, x, y, {});

    doc.setFontSize(this.pdfService.getTextFontSize());
    doc.setFont(this.pdfService.font, "normal");

    if (t.meetingPointUrl) {
      y += 7;
      const meetingPointTitle = this.translocoService.translate("TERRITORY_PDF_MEETING_POINT");
      doc.text(meetingPointTitle + ":", x, y);
      try {
        //Validate the url syntax
        new URL(t.meetingPointUrl);
        y += 5;
        doc.setTextColor("blue");
        const meetingPointClickText = this.translocoService.translate(
          "TERRITORY_PDF_MEETING_POINT_CLICK",
        );
        doc.textWithLink(meetingPointClickText, x, y, { url: t.meetingPointUrl });
      } catch (error) {
        //not valid url put it as regular text
        y += 5;
        doc.text(t.meetingPointUrl, x, y);
      }
      doc.setTextColor("black");
    }

    if (t.imageId) {
      y += 5;
      const imagePath = path.join(this.configService.terrImagesPath, t.imageId);
      const uint8array = new Uint8Array(readFileSync(imagePath));
      const imgProps = doc.getImageProperties(uint8array);

      let height = imgProps.height;
      let width = imgProps.width;
      const ratio = height / width;

      if (height > 240 || width > 180) {
        if (height > width) {
          height = 240;
          width = height * (1 / ratio);
          // Making reciprocal of ratio because ration of height as width is no valid here needs width as height
        } else if (width > height) {
          width = 180;
          height = width * ratio;
          // Ratio is valid here
        }
      }
      doc.addImage(uint8array, "png", x, y, width, height, null, "MEDIUM");
    }

    if (t.poligonId) {
      const mapLinkText =
        this.translocoService.translate("TERRITORY_TABLE_HEADER_MAPLINK") + ":";
      doc.text(mapLinkText, x, y + 20, {});
      doc.setTextColor("blue");
      doc.textWithLink(t.name, x, y + 30, { url: this.getUrlWithPolygonParams(t).toString() });
    }

    if (save) {
      doc.save(t.name);
    } else {
      return doc.output("blob");
    }
  }

  openTerritoriesFolder() {
    shell.openPath(path.join(this.configService.homeDir, "territories"));
  }

  sortByLessWorked(event: MatCheckboxChange) {
    if (event.checked) {
      const filtered = this.territories.filter((t) => t.returnedDates.length);
      this.territories = filtered.toSorted(this.sortService.sortTerritoriesByLastWorked);
      return;
    }
    this.territories = this.territoryService
      .getTerritories()
      .sort((a, b) => (a.name > b.name ? 1 : -1));
  }
}
