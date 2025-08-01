import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";

import { TerritoryService } from "../service/territory.service";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { TranslocoModule, TranslocoService } from "@ngneat/transloco";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { ParticipantPipe } from "app/participant/pipe/participant.pipe";
import { TerritoryGroupService } from "app/map/territory-group/service/territory-group.service";
import { RouterModule } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { OnlineService } from "app/online/service/online.service";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { TerritoryIncludesTerrGroupPipe } from "./pipes/territory-includes-terr-group.pipe";

@Component({
    selector: "app-massive-dates-territory",
    imports: [
        ReactiveFormsModule,
        TranslocoModule,
        MatButtonModule,
        MatFormFieldModule,
        MatDatepickerModule,
        RouterModule,
        MatIconModule,
        MatSnackBarModule,
        MatInputModule,
        ParticipantPipe,
        TerritoryIncludesTerrGroupPipe,
    ],
    templateUrl: "./massive-dates-territory.component.html",
    styleUrls: ["./massive-dates-territory.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MassiveDatesTerritoryComponent implements OnInit, OnDestroy {
  territories = this.territoryService.getTerritories(); //the reference
  territoryGroups = this.territoryGroupService.getTerritoryGroups();

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  formArray: FormGroup[] = [];

  constructor(
    private territoryService: TerritoryService,
    private territoryGroupService: TerritoryGroupService,
    private onlineService: OnlineService,
    private matSnackBar: MatSnackBar,
    private translocoService: TranslocoService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    for (const t of this.territories) {
      this.formArray.push(
        this.formBuilder.group({
          id: t.id,
          participants: this.formBuilder.array(t.participants),
          name: { value: t.name, disabled: true },
          assignedDates: this.formBuilder.array(t.assignedDates),
          returnedDates: this.formBuilder.array(t.returnedDates),
          groups: [t.groups],
        }),
      );
    }
  }

  ngOnDestroy(): void {
    let hasChanges = false;
    for (const form of this.formArray) {
      if (form.valid && form.touched) {
        hasChanges = true;
        const index = this.territories.findIndex((t) => t.id === form.controls.id.value);
        const t = this.territories[index];
        this.territories[index] = { ...t, ...form.value };
      }
    }
    this.territoryService.massiveSaveTerritoriesDates();
    if (hasChanges) {
      this.matSnackBar.open(
        this.translocoService.translate("CONFIG_SAVED"),
        this.translocoService.translate("CLOSE"),
        { duration: 2000 },
      );
    }
  }

  //Get the form array
  assignedDates(i: number) {
    return this.formArray[i].controls["assignedDates"] as FormArray;
  }

  //Get the form array
  returnedDates(i: number) {
    return this.formArray[i].controls["returnedDates"] as FormArray;
  }

  participants(i: number) {
    return this.formArray[i].controls["participants"] as FormArray;
  }

  getTerrGroupBorder(color: string) {
    return `${color ? color : "#000"}`;
  }
}
