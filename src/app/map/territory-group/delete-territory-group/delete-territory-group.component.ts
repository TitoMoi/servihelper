import { AsyncPipe, JsonPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ReactiveFormsModule, UntypedFormBuilder } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { RouterLink, Router, ActivatedRoute } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { TerritoryGroupService } from "app/map/territory-group/service/territory-group.service";
import { TerritoryService } from "app/map/territory/service/territory.service";
import { OnlineService } from "app/online/service/online.service";
import { Validators } from "ngx-editor";

@Component({
  selector: "app-delete-territory-group",
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
    AsyncPipe,
    JsonPipe,
  ],
  templateUrl: "./delete-territory-group.component.html",
  styleUrls: ["./delete-territory-group.component.scss"],
})
export class DeleteTerritoryGroupComponent implements OnInit {
  tgId = this.activatedRoute.snapshot.params.id;

  tg = this.territoryGroupService.getTerritoryGroup(this.tgId);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  territoriesToBeDeleted =
    this.territoryService
      .getTerritoriesByTerritoryGroupId(this.tgId)
      .filter((t) => t.groups.length === 1) ?? [];

  form = this.formBuilder.group({
    id: this.tg.id,
    name: [{ value: this.tg.name, disabled: true }, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private territoryGroupService: TerritoryGroupService,
    private territoryService: TerritoryService,
    private router: Router,
    private onlineService: OnlineService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {}

  onSubmit(): void {
    //get id
    const id = this.form.get("id").value;
    //delete the territory group
    this.territoryGroupService.deleteTerritoryGroup(id);

    //delete the group from territories
    this.territoryService.deleteTerritoryGroupById(id);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
