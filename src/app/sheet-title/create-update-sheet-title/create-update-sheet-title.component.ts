import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { AutoFocusDirective } from "../../autofocus/autofocus.directive";
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
})
export class CreateUpdateSheetTitleComponent {
  t = this.titleService.getTitle(this.activatedRoute.snapshot.params.id);

  isUpdate = this.t ? true : false;

  form = this.formBuilder.group({
    id: this.t ? this.t.id : undefined,
    name: [this.t ? this.t.name : undefined, Validators.required],
    order: [this.t ? this.t.order : undefined, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private titleService: TitleService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit(): void {
    const title = this.form.value;
    if (this.isUpdate) {
      this.titleService.updateTitle(title);
    } else {
      this.titleService.createTitle(title);
    }

    //navigate to parent
    const route = this.isUpdate ? "../.." : "..";
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }
}
