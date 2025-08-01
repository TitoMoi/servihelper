import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute, RouterLink } from "@angular/router";
import { ConfigService } from "app/config/service/config.service";

import { RoleInterface } from "../model/role.model";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule } from "@ngneat/transloco";
import { MatIconModule } from "@angular/material/icon";
import { AsyncPipe } from "@angular/common";
import { OnlineService } from "app/online/service/online.service";

@Component({
    selector: "app-delete-role",
    templateUrl: "./delete-role.component.html",
    styleUrls: ["./delete-role.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
    ]
})
export class DeleteRoleComponent {
  private formBuilder = inject(UntypedFormBuilder);
  private configService = inject(ConfigService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private onlineService = inject(OnlineService);

  role = this.configService.getRole(this.activatedRoute.snapshot.params.id);

  roleForm = this.formBuilder.group({
    id: this.role.id,
    name: [{ value: this.role.name, disabled: true }, Validators.required],
  });

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  onSubmit() {
    const role: RoleInterface = this.roleForm.value;
    //delete role
    this.configService.deleteRole(role.id);

    //if deleted role is existing role then set the administrator as default
    if (this.configService.getCurrentRoleId() === role.id) {
      this.configService.setAdminRole();
    }

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
