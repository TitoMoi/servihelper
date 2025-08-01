import { ChangeDetectionStrategy, Component } from "@angular/core";
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { AutoFocusDirective } from "../../directives/autofocus/autofocus.directive";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule } from "@ngneat/transloco";
import { PublicThemeService } from "../service/public-theme.service";
import { MatIconModule } from "@angular/material/icon";
import { AsyncPipe } from "@angular/common";
import { OnlineService } from "app/online/service/online.service";

@Component({
    selector: "app-create-update-public-theme",
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
        MatIconModule,
        AsyncPipe,
    ],
    templateUrl: "./create-update-public-theme.component.html",
    styleUrls: ["./create-update-public-theme.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateUpdatePublicThemeComponent {
  theme = this.publicThemeService.getPublicTheme(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  isUpdate = this.theme ? true : false;

  form = this.formBuilder.group({
    id: this.theme?.id,
    name: [this.theme?.name, Validators.required],
    order: [this.theme?.order, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private publicThemeService: PublicThemeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private onlineService: OnlineService,
  ) {}

  onSubmit(): void {
    const publicTheme = this.form.value;
    if (this.isUpdate) {
      this.publicThemeService.updatePublicTheme(publicTheme);
    } else {
      this.publicThemeService.createPublicTheme(publicTheme);
    }

    //navigate to parent
    const route = this.isUpdate ? "../.." : "..";
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }
}
