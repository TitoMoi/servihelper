import { Component } from "@angular/core";
import { ReactiveFormsModule, UntypedFormBuilder } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { RouterLink, Router, ActivatedRoute } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { Validators } from "ngx-editor";
import { TerritoryService } from "../service/territory.service";
import { OnlineService } from "app/online/service/online.service";
import { AsyncPipe } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-delete-territory",
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    AsyncPipe,
    MatIconModule,
  ],
  templateUrl: "./delete-territory.component.html",
  styleUrls: ["./delete-territory.component.scss"],
})
export class DeleteTerritoryComponent {
  t = this.territoryService.getTerritory(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  form = this.formBuilder.group({
    id: this.t.id,
    name: [{ value: this.t.name, disabled: true }, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private territoryService: TerritoryService,
    private router: Router,
    private onlineService: OnlineService,
    private activatedRoute: ActivatedRoute,
  ) {}
  onSubmit(): void {
    //get id
    const id = this.form.get("id").value;
    //delete the territory
    this.territoryService.deleteTerritory(id);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
