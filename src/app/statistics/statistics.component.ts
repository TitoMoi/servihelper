import { Component, OnDestroy, OnInit } from "@angular/core";
import { TerritoryCountComponent } from "./territory-count/territory-count.component";
import { GlobalCountComponent } from "./global-count/global-count.component";
import { TranslocoModule } from "@ngneat/transloco";
import { Observable, Subscription, combineLatest, map } from "rxjs";
import { ConfigService } from "app/config/service/config.service";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ConfigInterface } from "app/config/model/config.model";
import { RoleInterface } from "app/roles/model/role.model";
import { MatIconModule } from "@angular/material/icon";
import { FakeAccordionComponent } from "app/statistics/fake-accordion/fake-accordion.component";
@Component({
  selector: "app-statistics",
  templateUrl: "./statistics.component.html",
  styleUrls: ["./statistics.component.scss"],
  standalone: true,
  imports: [
    GlobalCountComponent,
    TerritoryCountComponent,
    TranslocoModule,
    MatIconModule,
    FakeAccordionComponent,
  ],
})
export class StatisticsComponent implements OnInit, OnDestroy {
  allowedAssignTypesIds = [];

  showGlobalCount = false;
  showTerritoryCount = false;

  subscription = new Subscription();

  config$: Observable<ConfigInterface> = this.configService.config$;
  roles$: Observable<RoleInterface[]> = this.config$.pipe(map((config) => config.roles));
  currentRoleId$: Observable<string> = this.config$.pipe(map((config) => config.role));

  constructor(
    private configService: ConfigService,
    private assignTypeService: AssignTypeService,
  ) {}

  ngOnInit(): void {
    //prepare emissions, emits also the first time
    this.subscription.add(
      combineLatest([this.currentRoleId$, this.roles$]).subscribe(([currentRole, roles]) => {
        this.allowedAssignTypesIds =
          currentRole === "administrator"
            ? this.getAllAssignTypesIds()
            : roles.find((r) => r.id === currentRole).assignTypesId;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  //first load or Admin
  getAllAssignTypesIds() {
    return this.assignTypeService.getAssignTypes()?.map((at) => at.id);
  }
}
