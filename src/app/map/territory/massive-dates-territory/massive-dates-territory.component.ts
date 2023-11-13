import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TerritoryService } from "../service/territory.service";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from "@angular/forms";
import { TranslocoModule } from "@ngneat/transloco";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";

@Component({
  selector: "app-massive-dates-territory",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
  ],
  templateUrl: "./massive-dates-territory.component.html",
  styleUrls: ["./massive-dates-territory.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MassiveDatesTerritoryComponent implements OnInit {
  territories = this.territoryService.getTerritories();

  formArray: FormGroup[] = [];

  constructor(private territoryService: TerritoryService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    for (const t of this.territories) {
      this.formArray.push(
        this.formBuilder.group({
          id: t.id,
          name: t.name,
          assignedDates: this.formBuilder.array(t.assignedDates),
          returnedDates: this.formBuilder.array(t.returnedDates),
        })
      );
    }
  }

  fc(i: number, name: string, j: number) {
    return this.formArray[i].get(name)[j] as FormControl;
  }

  //Get the form array
  returnedDates(i: number) {
    return this.formArray[i].controls["returnedDates"] as FormArray;
  }
}
