import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";

import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-update-assign-type",
  templateUrl: "./update-assignType.component.html",
  styleUrls: ["./update-assignType.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateAssignTypeComponent implements OnInit {
  //for the color component that doesnt support reactive forms
  color;

  assignTypeForm: UntypedFormGroup = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
    hasAssistant: [false],
    order: [undefined, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private assignTypeService: AssignTypeService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const assignType = this.assignTypeService.getAssignType(
      this.activatedRoute.snapshot.params.id
    );
    this.assignTypeForm.setValue({
      id: assignType.id,
      name: assignType.name,
      hasAssistant: assignType.hasAssistant || false,
      order: assignType.order,
    });
    this.color = assignType.color;
  }

  onSubmit(): void {
    this.assignTypeService.updateAssignType({
      ...this.assignTypeForm.value,
      color: this.color,
    });

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
