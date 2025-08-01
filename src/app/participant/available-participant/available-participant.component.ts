import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import { ParticipantService } from '../service/participant.service';
import { AssignTypePipe } from 'app/assigntype/pipe/assign-type.pipe';
import { AssignTypeService } from 'app/assigntype/service/assigntype.service';
import { ParticipantAssignTypeInterface, ParticipantInterface } from '../model/participant.model';
import { SortService } from 'app/services/sort.service';
import { ConfigService } from 'app/config/service/config.service';
import { Observable, Subscription, map } from 'rxjs';
import { ConfigInterface } from 'app/config/model/config.model';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExportService } from 'app/services/export.service';
import { MatIconModule } from '@angular/material/icon';
import { AssignTypeNamePipe } from 'app/assigntype/pipe/assign-type-name.pipe';
import { AssignTypeInterface } from 'app/assigntype/model/assigntype.model';
import { LockService } from 'app/lock/service/lock.service';
import { OnlineService } from 'app/online/service/online.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgClass } from '@angular/common';
import { GetNumberOfParticipantsPipe } from './get-number-of-participants.pipe';
@Component({
  selector: 'app-available-participant',
  imports: [
    AssignTypePipe,
    AssignTypeNamePipe,
    TranslocoDirective,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    NgClass,
    GetNumberOfParticipantsPipe
  ],
  templateUrl: './available-participant.component.html',
  styleUrls: ['./available-participant.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailableParticipantComponent implements OnInit, OnDestroy {
  private participantService = inject(ParticipantService);
  private assignTypeService = inject(AssignTypeService);
  private sortService = inject(SortService);
  private configService = inject(ConfigService);
  private exportService = inject(ExportService);
  private lockService = inject(LockService);
  private onlineService = inject(OnlineService);
  private translocoService = inject(TranslocoService);
  private matSnackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  participants = this.participantService
    .getParticipants() //We get the reference so we are manipulating participants
    .filter(p => !p.isExternal && p.available)
    .sort(this.sortService.sortParticipantsByGender);

  assignTypes: AssignTypeInterface[] = [];
  assignTypesAssistant = [];

  allowedAssignTypesIds = [];

  subscription = new Subscription();

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  //To not create too many subscriptions on the template
  isNetStatusOffline = false;

  //To show or not the snackbar
  hasChanges = false;

  config$: Observable<ConfigInterface> = this.configService.config$;
  currentRoleId$: Observable<string> = this.config$.pipe(map(config => config.role));

  ngOnInit(): void {
    this.getData();

    this.subscription.add(
      this.currentRoleId$.subscribe(() => {
        this.getData();
      })
    );

    this.subscription.add(
      this.netStatusOffline$.subscribe(isOffline => {
        this.isNetStatusOffline = isOffline;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.hasChanges) {
      this.matSnackBar.open(
        this.translocoService.translate('CONFIG_SAVED'),
        this.translocoService.translate('CLOSE'),
        { duration: 2000 }
      );
      this.participantService.saveParticipantsToFile();
      this.participantService.updateMapOfParticipants();

      this.lockService.updateTimestamp();
    }
  }

  getData() {
    if (this.configService.isAdminRole()) {
      this.allowedAssignTypesIds = this.getAllAssignTypesIds();
    } else {
      this.allowedAssignTypesIds = this.configService
        .getRoles()
        .find(r => r.id === this.configService.role).assignTypesId;
    }

    this.assignTypes = this.assignTypeService
      .getAssignTypes()
      .filter(at => this.allowedAssignTypesIds.includes(at.id));

    this.assignTypesAssistant = this.assignTypeService
      .getAssignTypes()
      .filter(at => this.allowedAssignTypesIds.includes(at.id) && at.hasAssistant);

    this.cdr.detectChanges();
  }

  checkIncludesAssignTypeAsPrincipal(
    assignTypes: ParticipantAssignTypeInterface[],
    assignTypeId: string
  ) {
    return assignTypes.some(at => at.assignTypeId === assignTypeId && at.canPrincipal);
  }

  checkIncludesAssignTypeAsAssistant(
    assignTypes: ParticipantAssignTypeInterface[],
    assignTypeId: string
  ) {
    return assignTypes.some(at => at.assignTypeId === assignTypeId && at.canAssistant);
  }

  //first load or Admin
  getAllAssignTypesIds() {
    return this.assignTypeService.getAssignTypes()?.map(at => at.id);
  }

  // eslint-disable-next-line complexity
  changeAvailability(
    participant: ParticipantInterface,
    assignType: AssignTypeInterface,
    isPrincipal: boolean
  ) {
    this.hasChanges = true;
    //No participant means all participants unmark if some has mark or mark all if noone has mark
    if (!participant) {
      let hasSomeCheck;
      for (const p of this.participants) {
        hasSomeCheck = p.assignTypes.some(
          at =>
            at.assignTypeId === assignType.id && (isPrincipal ? at.canPrincipal : at.canAssistant)
        );
      }
      if (hasSomeCheck) {
        for (const p of this.participants) {
          const participantAt = p.assignTypes.find(at => at.assignTypeId === assignType.id);

          //This means that the assign type is new from an import, and has no object, we need to create it.
          if (!participantAt) {
            this.createNewAssignTypeReference(p, assignType);
            continue;
          }

          isPrincipal ? (participantAt.canPrincipal = false) : (participantAt.canAssistant = false);
        }
        return;
      }
      for (const p of this.participants) {
        const participantAt = p.assignTypes.find(at => at.assignTypeId === assignType.id);

        //This means that the assign type is new from an import, and has no object, we need to create it.
        if (!participantAt) {
          this.createNewAssignTypeReference(p, assignType);
          continue;
        }

        isPrincipal ? (participantAt.canPrincipal = true) : (participantAt.canAssistant = true);
      }
      return;
    }

    //Else one participant
    const participantAt = participant.assignTypes.find(at => at.assignTypeId === assignType.id);
    //This means that the assign type is new from an import, and has no object, we need to create it.
    if (!participantAt) {
      const pAtNew: ParticipantAssignTypeInterface = {
        assignTypeId: assignType.id,
        canPrincipal: true,
        canAssistant: true
      };
      participant.assignTypes.push(pAtNew);
      return;
    }
    isPrincipal
      ? (participantAt.canPrincipal = !participantAt.canPrincipal)
      : (participantAt.canAssistant = !participantAt.canAssistant);
  }

  createNewAssignTypeReference(p: ParticipantInterface, assignType: AssignTypeInterface) {
    const pAtNew: ParticipantAssignTypeInterface = {
      assignTypeId: assignType.id,
      canPrincipal: true,
      canAssistant: true
    };
    p.assignTypes.push(pAtNew);
  }

  async toPng(id) {
    await this.exportService.toPng(id, 'available');
  }
}
