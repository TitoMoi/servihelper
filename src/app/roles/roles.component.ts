import { Component, inject } from "@angular/core";
import { ConfigService } from "app/config/service/config.service";
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
    imports: [
        TranslocoModule,
        MatButtonModule,
        RouterLink,
        RouterLinkActive,
        MatIconModule,
        AsyncPipe,
    ]
})
export class RolesComponent {
  private configService = inject(ConfigService);
  private onlineService = inject(OnlineService);

  roles: RoleInterface[] = this.configService.getRoles();

  //Table
  displayedColumns: string[] = ["name", "editIcon", "deleteIcon"];

  netStatusOffline$ = this.onlineService.netStatusOffline$;
}
