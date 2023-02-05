import { Component, OnInit } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
import { map, Observable } from "rxjs";
import { RoleInterface } from "./model/role.model";

@Component({
  selector: "app-roles",
  templateUrl: "./roles.component.html",
  styleUrls: ["./roles.component.scss"],
})
export class RolesComponent implements OnInit {
  roles$: Observable<RoleInterface[]> = this.configService.config$.pipe(
    map((config) => config.roles)
  );

  //Table
  displayedColumns: string[] = ["name", "editIcon", "deleteIcon"];

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {}

  trackByIdFn(index, role: RoleInterface) {
    return role.id;
  }
}
