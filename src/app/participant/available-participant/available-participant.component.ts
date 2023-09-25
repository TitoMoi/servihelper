import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ParticipantService } from "../service/participant.service";
import { AssignTypePipe } from "app/assigntype/pipe/assign-type.pipe";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import {
  ParticipantAssignTypeInterface,
  ParticipantInterface,
} from "../model/participant.model";
import { SortService } from "app/services/sort.service";
import { ConfigService } from "app/config/service/config.service";
import { Observable, Subscription, combineLatest, map } from "rxjs";
import { RoleInterface } from "app/roles/model/role.model";
import { ConfigInterface } from "app/config/model/config.model";
import { TranslocoModule } from "@ngneat/transloco";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ExportService } from "app/services/export.service";
import { MatIconModule } from "@angular/material/icon";
import { AssignTypeNamePipe } from "app/assigntype/pipe/assign-type-name.pipe";
import { AssignTypeInterface } from "app/assigntype/model/assigntype.model";
import { LockService } from "app/lock/service/lock.service";
import { OnlineService } from "app/online/service/online.service";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-available-participant",
  standalone: true,
  imports: [
    CommonModule,
    AssignTypePipe,
    AssignTypeNamePipe,
    TranslocoModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: "./available-participant.component.html",
  styleUrls: ["./available-participant.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailableParticipantComponent {
  participants = this.participantService
    .getParticipants()
    .filter((p) => !p.isExternal && p.available)
    .sort(this.sortService.sortParticipantsByGender);

  assignTypes = [];
  assignTypesAssistant = [];

  allowedAssignTypesIds = [];

  subscription = new Subscription();

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  //To not create too many subscriptions on the template
  isNetStatusOffline = false;

  config$: Observable<ConfigInterface> = this.configService.config$;
  roles$: Observable<RoleInterface[]> = this.config$.pipe(map((config) => config.roles));
  currentRoleId$: Observable<string> = this.config$.pipe(map((config) => config.role));

  constructor(
    private participantService: ParticipantService,
    private assignTypeService: AssignTypeService,
    private sortService: SortService,
    private configService: ConfigService,
    private exportService: ExportService,
    private lockService: LockService,
    private onlineService: OnlineService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    //prepare emissions, emits also the first time
    this.subscription.add(
      combineLatest([this.currentRoleId$, this.roles$]).subscribe(([currentRole, roles]) => {
        this.allowedAssignTypesIds =
          currentRole === "administrator"
            ? this.getAllAssignTypesIds()
            : roles.find((r) => r.id === currentRole).assignTypesId;

        this.assignTypes = this.assignTypeService
          .getAssignTypes()
          .filter((at) => this.allowedAssignTypesIds.includes(at.id));

        this.assignTypesAssistant = this.assignTypeService
          .getAssignTypes()
          .filter((at) => this.allowedAssignTypesIds.includes(at.id) && at.hasAssistant);

        this.cdr.detectChanges();
      })
    );

    this.subscription.add(
      this.netStatusOffline$.subscribe((isOffline) => {
        this.isNetStatusOffline = isOffline;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.participantService.saveParticipantsToFile();
    this.lockService.updateTimestamp();
  }

  checkIncludesAssignTypeAsPrincipal(
    assignTypes: ParticipantAssignTypeInterface[],
    assignTypeId: string
  ) {
    return assignTypes.some((at) => at.assignTypeId === assignTypeId && at.canPrincipal);
  }

  checkIncludesAssignTypeAsAssistant(
    assignTypes: ParticipantAssignTypeInterface[],
    assignTypeId: string
  ) {
    return assignTypes.some((at) => at.assignTypeId === assignTypeId && at.canAssistant);
  }

  //first load or Admin
  getAllAssignTypesIds() {
    return this.assignTypeService.getAssignTypes()?.map((at) => at.id);
  }

  changeAvailability(
    participant: ParticipantInterface,
    assignType: AssignTypeInterface,
    isPrincipal: boolean
  ) {
    const participantAt = participant.assignTypes.find(
      (at) => at.assignTypeId === assignType.id
    );
    isPrincipal
      ? (participantAt.canPrincipal = !participantAt.canPrincipal)
      : (participantAt.canAssistant = !participantAt.canAssistant);
  }

  async toPng(id) {
    await this.exportService.toPng(id, "available");
  }
}
