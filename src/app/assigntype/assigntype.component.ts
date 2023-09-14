import { AssignTypeInterface } from "app/assigntype/model/assigntype.model";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";

import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { NgIf, NgFor } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { TranslocoModule } from "@ngneat/transloco";
import { AssignTypeNamePipe } from "./pipe/assign-type-name.pipe";

@Component({
  selector: "app-assign-type",
  templateUrl: "./assigntype.component.html",
  styleUrls: ["./assigntype.component.scss"],
  standalone: true,
  imports: [
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    NgIf,
    NgFor,
    MatIconModule,
    AssignTypeNamePipe,
  ],
})
export class AssignTypeComponent {
  //In memory assignTypes
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  constructor(private assignTypeService: AssignTypeService) {}
}
