import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoModule, TranslocoService } from "@ngneat/transloco";
import { TerritoryContextInterface } from "../model/map.model";
import { TerritoryService } from "./service/territory.service";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatExpansionModule } from "@angular/material/expansion";
import { TranslocoLocaleModule } from "@ngneat/transloco-locale";
import { TerritoryGroupService } from "../territory-group/service/territory-group.service";
import { ParticipantPipe } from "app/participant/pipe/participant.pipe";
import { MatTooltipModule } from "@angular/material/tooltip";
import { PolygonService } from "./service/polygon.service";
import { clipboard } from "electron";
import { OnlineService } from "app/online/service/online.service";
import { PdfService } from "app/services/pdf.service";
import path from "path";
import { ConfigService } from "app/config/service/config.service";
import { readFileSync } from "fs-extra";

@Component({
  selector: "app-territory",
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    NgIf,
    NgFor,
    MatIconModule,
    MatExpansionModule,
    MatCheckboxModule,
    TranslocoLocaleModule,
    ParticipantPipe,
    MatTooltipModule,
  ],
  templateUrl: "./territory.component.html",
  styleUrls: ["./territory.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerritoryComponent {
  territories: TerritoryContextInterface[] = this.territoryService
    .getTerritories()
    .sort((a, b) => (a.name > b.name ? 1 : -1));
  territoryGroups = this.territoryGroupService
    .getTerritoryGroups()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  constructor(
    private territoryService: TerritoryService,
    private territoryGroupService: TerritoryGroupService,
    private polygonService: PolygonService,
    private onlineService: OnlineService,
    private pdfService: PdfService,
    private translocoService: TranslocoService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef
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
      JSON.stringify(this.polygonService.getPolygon(t.poligonId).latLngList)
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
      "selection"
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

  toPdf(t: TerritoryContextInterface) {
    const doc = this.getPdfSheet();
    doc.setFont(this.pdfService.font, "bold");

    let x = this.pdfService.getInitialWidth();
    let y = this.pdfService.getInitialHeight();

    doc.setFontSize(14);
    doc.text(t.name, x, y, {});

    doc.setFontSize(this.pdfService.getTextFontSize());
    doc.setFont(this.pdfService.font, "normal");

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

    doc.save(t.name);
  }
}
