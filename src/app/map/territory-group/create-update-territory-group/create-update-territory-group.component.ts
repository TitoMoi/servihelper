import { Component, inject } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TerritoryGroupService } from "../../services/territory-group.service";
import { ReactiveFormsModule, Validators, FormBuilder } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { TranslocoModule } from "@ngneat/transloco";
import { AutoFocusDirective } from "app/autofocus/autofocus.directive";
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: "app-create-update-territory-group",
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    NgIf,
    NgFor,
    MatFormFieldModule,
    MatInputModule,
    AutoFocusDirective,
    ReactiveFormsModule,
    MatCardModule,
  ],
  templateUrl: "./create-update-territory-group.component.html",
  styleUrls: ["./create-update-territory-group.component.scss"],
})
export class CreateUpdateTerritoryGroupComponent {
  territoryGroupService = inject(TerritoryGroupService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  gm = this.territoryGroupService.getTerritoryGroup(this.activatedRoute.snapshot.params.id);

  isUpdate = this.gm ? true : false;

  form = this.formBuilder.group({
    id: this.gm?.id,
    name: [this.gm?.name, Validators.required],
    color: [this.gm ? this.gm.color : "#FFFFFF"],
    order: [this.gm?.order, Validators.required],
  });

  onSubmit(): void {
    if (this.isUpdate) {
      this.territoryGroupService.updateTerritoryGroup(this.form.value);
    } else {
      this.territoryGroupService.createTerritoryGroup(this.form.value);
    }
    const route = this.isUpdate ? "../.." : "..";

    //navigate to parent
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }
}
