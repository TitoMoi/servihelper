import { ChangeDetectionStrategy, Component } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ConfigService } from "app/config/service/config.service";

@Component({
  selector: "app-update-role",
  templateUrl: "./update-role.component.html",
  styleUrls: ["./update-role.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateRoleComponent {
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  roles = this.configService.getRoles();
  role = this.roles.find(
    (r) => r.id === this.activatedRoute.snapshot.params.id
  );

  //for the pipe
  assignTypesId = this.role.assignTypesId || [];

  roleForm = this.formBuilder.group({
    id: this.role.id,
    name: [this.role.name, Validators.required],
    assignTypesId: [this.role.assignTypesId],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private configService: ConfigService,
    private assignTypeService: AssignTypeService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  //Add or remove
  changeCheckbox(assignTypeId: string) {
    const atCtrl = this.roleForm.get("assignTypesId");
    let assignTypesId: string[] = atCtrl.value;
    const index = assignTypesId.indexOf(assignTypeId);
    if (index > -1) {
      assignTypesId = assignTypesId.filter((atId) => atId !== assignTypeId);
    } else {
      assignTypesId.push(assignTypeId);
    }
    atCtrl.patchValue(assignTypesId);
  }

  onSubmit() {
    const value = this.roleForm.value;
    this.configService.updateRole(value);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
