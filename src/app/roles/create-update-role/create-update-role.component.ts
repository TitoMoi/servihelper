import { ChangeDetectionStrategy, Component } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ConfigService } from "app/config/service/config.service";

@Component({
  selector: "app-create-update-role",
  templateUrl: "./create-update-role.component.html",
  styleUrls: ["./create-update-role.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateRoleComponent {
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  r = this.configService
    .getRoles()
    .find((role) => role.id === this.activatedRoute.snapshot.params.id);

  isUpdate = this.r ? true : false;

  form = this.formBuilder.group({
    id: this.r ? this.r.id : undefined,
    name: [this.r ? this.r.name : undefined, Validators.required],
    assignTypesId: [this.r ? this.r.assignTypesId : [], Validators.required],
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
    const atCtrl = this.form.get("assignTypesId");
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
    const value = this.form.value;

    if (this.isUpdate) {
      this.configService.updateRole(value);
    } else {
      this.configService.addRole(value);
    }
    //navigate to parent
    const route = this.isUpdate ? "../.." : "..";

    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }
}