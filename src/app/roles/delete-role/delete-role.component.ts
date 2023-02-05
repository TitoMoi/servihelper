import { ChangeDetectionStrategy, Component } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ConfigService } from "app/config/service/config.service";

import { RoleInterface } from "../model/role.model";

@Component({
  selector: "app-delete-role",
  templateUrl: "./delete-role.component.html",
  styleUrls: ["./delete-role.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteRoleComponent {
  role = this.configService.getRole(this.activatedRoute.snapshot.params.id);

  roleForm = this.formBuilder.group({
    id: this.role.id,
    name: [{ value: this.role.name, disabled: true }, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private configService: ConfigService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit() {
    const role: RoleInterface = this.roleForm.value;
    //delete role
    this.configService.deleteRole(role.id);

    //if deleted role is existing role then set the administrator as default
    if (this.configService.getCurrentRole() === role.id) {
      this.configService.setAdminRole();
    }

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
