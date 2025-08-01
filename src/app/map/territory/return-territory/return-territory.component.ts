import { AfterViewInit, ChangeDetectorRef, Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { Validators } from 'ngx-editor';
import { TerritoryService } from '../service/territory.service';
import { AsyncPipe } from '@angular/common';
import { OnlineService } from 'app/online/service/online.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-delete-territory',
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    RouterLink,
    AsyncPipe,
    MatIconModule
  ],
  templateUrl: './return-territory.component.html',
  styleUrls: ['./return-territory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReturnTerritoryComponent implements AfterViewInit {
  private formBuilder = inject(UntypedFormBuilder);
  private territoryService = inject(TerritoryService);
  private router = inject(Router);
  private onlineService = inject(OnlineService);
  private activatedRoute = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  t = this.territoryService.getTerritory(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  form = this.formBuilder.group({
    id: this.t.id,
    name: [{ value: this.t.name, disabled: true }, Validators.required],
    returnDate: [{ value: undefined }, Validators.required]
  });

  ngAfterViewInit(): void {
    this.form.markAllAsTouched();
    this.cdr.detectChanges();
  }
  onSubmit(): void {
    //get id
    const { id, returnDate } = this.form.value;
    //return the territory
    this.territoryService.returnTerritory(id, returnDate);

    //navigate to parent
    this.router.navigate(['../..'], {
      relativeTo: this.activatedRoute
    });
  }
}
