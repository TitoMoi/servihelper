import { Component, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";

@Component({
  selector: "app-assign-type",
  templateUrl: "./assignType.component.html",
  styleUrls: ["./assignType.component.scss"],
})
export class AssignTypeComponent implements OnInit {
  //In memory assignTypes
  assignTypes: AssignTypeInterface[];
  //Table
  displayedColumns: string[];
  //datasource
  dataSource: AssignTypeInterface[];
  //icons
  icons: string[];
  constructor(
    private assignTypeService: AssignTypeService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.displayedColumns = ["name", "editIcon", "deleteIcon"];
    this.icons = ["garbage", "edit"];
  }

  async ngOnInit(): Promise<void> {
    //Register icons
    for (const iconFileName of this.icons) {
      this.matIconRegistry.addSvgIcon(
        iconFileName,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          "assets/icons/" + iconFileName + ".svg"
        )
      );
    }

    this.assignTypes = await this.assignTypeService.getAssignTypes();
    await this.fillDataSource(this.assignTypes);
  }

  trackByIdFn(index, assignType: AssignTypeInterface) {
    return assignType.id;
  }

  async fillDataSource(assignTypesPage: AssignTypeInterface[]) {
    const dataSourceTemp: AssignTypeInterface[] = [];
    for (const assignType of assignTypesPage) {
      //Populate datasource, values is in order
      dataSourceTemp.push({
        id: assignType.id,
        name: assignType.name,
      });
    }
    //Update the view
    this.dataSource = dataSourceTemp;
  }
}
