import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AssignTypeInterface } from "app/assignType/model/assignType.model";
import { AssignTypeService } from "app/assignType/service/assignType.service";

@Component({
  selector: "app-update-assign-type",
  templateUrl: "./update-assignType.component.html",
  styleUrls: ["./update-assignType.component.css"],
})
export class UpdateAssignTypeComponent implements OnInit {
  assignTypeForm: FormGroup = this.formBuilder.group({
    id: undefined,
    name: [undefined, Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
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
    });
  }

  onSubmit(assignType: AssignTypeInterface): void {
    this.assignTypeService.updateAssignType(assignType);

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
