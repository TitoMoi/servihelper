import { Component } from "@angular/core";
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { SheetTitleService } from "../service/sheet-title.service";
import { SheetTitleInterface } from "../model/sheet-title.model";
import { ConfigService } from "app/config/service/config.service";
import { AssignmentService } from "app/assignment/service/assignment.service";

@Component({
    selector: "app-delete-sheet-title",
    imports: [
        TranslocoModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RouterLink,
    ],
    templateUrl: "./delete-sheet-title.component.html",
    styleUrls: ["./delete-sheet-title.component.scss"]
})
export class DeleteSheetTitleComponent {
  title = this.sheetTitleService.getTitle(this.activatedRoute.snapshot.params.id);

  form = this.formBuilder.group({
    id: this.title.id,
    name: [{ value: this.title.name, disabled: true }, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private sheetTitleService: SheetTitleService,
    private assignmentService: AssignmentService,
    private configService: ConfigService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  onSubmit(title: SheetTitleInterface): void {
    //delete room
    const isDeleted = this.sheetTitleService.deleteSheetTitle(title.id);

    if (isDeleted) {
      //Remove the title in the existing assignments
      this.assignmentService.removeAssignmentsSheetTitleProperty(title.id);

      //if the sheet title was the default on the config file "assignmentHeaderTitle" then delete it too
      const config = this.configService.getConfig();

      if (config.assignmentHeaderTitle === title.id) {
        this.configService.updateConfigByKey("assignmentHeaderTitle", "");
      }
    }

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
