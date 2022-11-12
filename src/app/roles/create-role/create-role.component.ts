import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";
import { ConfigService } from "app/config/service/config.service";

@Component({
  selector: "app-create-role",
  templateUrl: "./create-role.component.html",
  styleUrls: ["./create-role.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRoleComponent {
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  roleForm = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
    assignTypesId: [[], Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private configService: ConfigService,
    private assignTypeService: AssignTypeService
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

    this.configService.addRole(value);
  }
}
