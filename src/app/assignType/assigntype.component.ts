import { AssignTypeInterface } from 'app/assignType/model/assignType.model';
import { AssignTypeService } from 'app/assignType/service/assignType.service';

import { Component, OnInit } from '@angular/core';

@Component({
  selector: "app-assign-type",
  templateUrl: "./assignType.component.html",
  styleUrls: ["./assignType.component.scss"],
})
export class AssignTypeComponent implements OnInit {
  //In memory assignTypes
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));
  //Table
  displayedColumns: string[] = ["name", "order", "editIcon", "deleteIcon"];
  //datasource
  dataSource: AssignTypeInterface[];

  constructor(private assignTypeService: AssignTypeService) {}

  ngOnInit(): void {
    this.fillDataSource(this.assignTypes);
  }

  trackByIdFn(index, assignType: AssignTypeInterface) {
    return assignType.id;
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
    //Update the view
    this.dataSource = dataSourceTemp;
  }
}
