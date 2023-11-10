import { AfterViewInit, ChangeDetectorRef, Component } from "@angular/core";
import { ReactiveFormsModule, UntypedFormBuilder } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { RouterLink, Router, ActivatedRoute } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { Validators } from "ngx-editor";
import { TerritoryService } from "../service/territory.service";
import { AsyncPipe, NgIf } from "@angular/common";
import { OnlineService } from "app/online/service/online.service";
import { MatIconModule } from "@angular/material/icon";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { ChangeDetectionStrategy } from "@angular/core";

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
    MatDatepickerModule,
    RouterLink,
    NgIf,
    AsyncPipe,
    MatIconModule,
  ],
  templateUrl: "./return-territory.component.html",
  styleUrls: ["./return-territory.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnTerritoryComponent implements AfterViewInit {
  t = this.territoryService.getTerritory(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  form = this.formBuilder.group({
    id: this.t.id,
    name: [{ value: this.t.name, disabled: true }, Validators.required],
    returnDate: [{ value: undefined }, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private territoryService: TerritoryService,
    private router: Router,
    private onlineService: OnlineService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.form.markAllAsTouched();
    this.cdr.detectChanges();
  }
  onSubmit(): void {
    //get id
    const id = this.form.get("id").value;
    //return the territory
    this.territoryService.returnTerritory(id);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
