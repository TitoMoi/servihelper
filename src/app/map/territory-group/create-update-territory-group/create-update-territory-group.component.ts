import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TerritoryGroupService } from "../service/territory-group.service";
import {
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
  FormControl,
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { TranslocoModule } from "@ngneat/transloco";
import { AutoFocusDirective } from "app/directives/autofocus/autofocus.directive";
import { MatCardModule } from "@angular/material/card";
import { TerritoryGroupInterface } from "app/map/model/map.model";
import { MatIconModule } from "@angular/material/icon";
import { OnlineService } from "app/online/service/online.service";

@Component({
  selector: "app-create-update-territory-group",
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    AutoFocusDirective,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: "./create-update-territory-group.component.html",
  styleUrls: ["./create-update-territory-group.component.scss"],
})
export class CreateUpdateTerritoryGroupComponent {
  territoryGroupService = inject(TerritoryGroupService);
  private formBuilder = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private onlineService = inject(OnlineService);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  gm = this.territoryGroupService.getTerritoryGroup(this.activatedRoute.snapshot.params.id);

  isUpdate = this.gm ? true : false;

  form = this.formBuilder.group({
    id: this.gm?.id,
    name: new FormControl(this.gm?.name, { validators: Validators.required }),
    color: [this.gm ? this.gm.color : "#FFFFFF"],
    order: [this.gm?.order, Validators.required],
  });

  onSubmit(): void {
    const tg = this.form.value as TerritoryGroupInterface;
    if (this.isUpdate) {
      this.territoryGroupService.updateTerritoryGroup(tg);
    } else {
      this.territoryGroupService.createTerritoryGroup(tg);
    }
    const route = this.isUpdate ? "../.." : "..";

    //navigate to parent
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }
}
