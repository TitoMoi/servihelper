import { Component, OnInit } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
import { filter, map, Observable } from "rxjs";
import { RoleInterface } from "./model/role.model";
import { MatIconModule } from "@angular/material/icon";
import { AsyncPipe } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { TranslocoModule } from "@ngneat/transloco";
import { OnlineService } from "app/online/service/online.service";

@Component({
  selector: "app-roles",
  templateUrl: "./roles.component.html",
  styleUrls: ["./roles.component.scss"],
  standalone: true,
  imports: [
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    AsyncPipe,
  ],
})
export class RolesComponent implements OnInit {
  roles$: Observable<RoleInterface[]> = this.configService.config$.pipe(
    filter((config) => config.roles.length > 0),
    map((config) => config.roles),
  );

  //Table
  displayedColumns: string[] = ["name", "editIcon", "deleteIcon"];

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  constructor(
    private configService: ConfigService,
    private onlineService: OnlineService,
  ) {}

  ngOnInit(): void {}

  trackByIdFn(index, role: RoleInterface) {
    return role.id;
  }
}
