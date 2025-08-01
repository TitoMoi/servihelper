import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { TerritoryCountComponent } from "./territory-count/territory-count.component";
import { GlobalCountComponent } from "./global-count/global-count.component";
import { TranslocoModule } from "@ngneat/transloco";
import { Observable, Subscription, map } from "rxjs";
import { ConfigService } from "app/config/service/config.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ConfigInterface } from "app/config/model/config.model";
import { RoleInterface } from "app/roles/model/role.model";
import { MatIconModule } from "@angular/material/icon";
import { FakeAccordionComponent } from "app/statistics/fake-accordion/fake-accordion.component";
import { TerritoryGraphicsComponent } from "app/statistics/territory-graphics/territory-graphics.component";
@Component({
    selector: "app-statistics",
    templateUrl: "./statistics.component.html",
    styleUrls: ["./statistics.component.scss"],
    imports: [
        GlobalCountComponent,
        TerritoryCountComponent,
        TerritoryGraphicsComponent,
        TranslocoModule,
        MatIconModule,
        FakeAccordionComponent,
    ]
})
export class StatisticsComponent implements OnInit, OnDestroy {
  private configService = inject(ConfigService);
  private assignTypeService = inject(AssignTypeService);

  allowedAssignTypesIds = [];

  showGlobalCount = false;
  showTerritoryCount = false;
  showTerritoryGraphics = false;

  subscription = new Subscription();

  config$: Observable<ConfigInterface> = this.configService.config$;
  roles$: Observable<RoleInterface[]> = this.config$.pipe(map((config) => config.roles));
  currentRoleId$: Observable<string> = this.config$.pipe(map((config) => config.role));

  ngOnInit(): void {
    this.getData();

    //prepare for changes
    this.subscription.add(this.currentRoleId$.subscribe(() => this.getData()));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getData() {
    if (this.configService.isAdminRole()) {
      this.allowedAssignTypesIds = this.getAllAssignTypesIds();
    } else {
      this.allowedAssignTypesIds = this.configService.getRole(
        this.configService.getCurrentRoleId(),
      ).assignTypesId;
    }
  }

  //first load or Admin
  getAllAssignTypesIds() {
    return this.assignTypeService.getAssignTypes()?.map((at) => at.id);
  }
}
