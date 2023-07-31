import { SheetTitleService } from "app/sheet-title/service/sheet-title.service";

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { AutoFocusDirective } from "../../directives/autofocus/autofocus.directive";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule } from "@ngneat/transloco";

@Component({
  selector: "app-create-update-sheet-title",
  standalone: true,
  imports: [
    TranslocoModule,
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    AutoFocusDirective,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: "./create-update-sheet-title.component.html",
  styleUrls: ["./create-update-sheet-title.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateSheetTitleComponent {
  t = this.sheetTitleService.getTitle(this.activatedRoute.snapshot.params.id);

  isUpdate = this.t ? true : false;

  form = this.formBuilder.group({
    id: this.t?.id,
    name: [this.t?.name, Validators.required],
    order: [this.t?.order, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private sheetTitleService: SheetTitleService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit(): void {
    const title = this.form.value;
    if (this.isUpdate) {
      this.sheetTitleService.updateTitle(title);
    } else {
      this.sheetTitleService.createTitle(title);
    }

    //navigate to parent
    const route = this.isUpdate ? "../.." : "..";
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }
}
