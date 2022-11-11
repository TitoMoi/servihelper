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
export class CreateRoleComponent implements OnInit {
  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  roleForm = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
    selected: [false],
    assignTypesId: [[], Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private configService: ConfigService,
    private assignTypeService: AssignTypeService
  ) {}

  ngOnInit(): void {}

  changeCheckbox(assignTypeId: string) {
    const atCtrl = this.roleForm.get("assignTypesId");
    const assignTypes: string[] = atCtrl.value;
    assignTypes.push(assignTypeId);
    atCtrl.patchValue(assignTypes);
  }

  onSubmit() {
    const value = this.roleForm.value;

    this.configService.addRole(value);
  }
}
