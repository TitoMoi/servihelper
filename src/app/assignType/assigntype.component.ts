import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";

import { Component, OnInit } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { NgIf, NgFor } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { TranslocoModule } from "@ngneat/transloco";

@Component({
  selector: "app-assign-type",
  templateUrl: "./assignType.component.html",
  styleUrls: ["./assignType.component.scss"],
  standalone: true,
  imports: [
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    NgIf,
    NgFor,
    MatIconModule,
  ],
})
export class AssignTypeComponent implements OnInit {
  //In memory assignTypes
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  constructor(private assignTypeService: AssignTypeService) {}

  ngOnInit(): void {
    this.fillDataSource(this.assignTypes);
  }

  fillDataSource(assignTypesPage: AssignTypeInterface[]) {
    const dataSourceTemp: AssignTypeInterface[] = [];
    for (const assignType of assignTypesPage) {
      //Populate datasource, values is in order
      dataSourceTemp.push({
        id: assignType.id,
        name: assignType.name,
        order: assignType.order,
      });
    }
  }
}
