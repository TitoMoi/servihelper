import { Component } from "@angular/core";
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { PublicThemeService } from "../service/public-theme.service";
import { PublicThemeInterface } from "../model/public-theme.model";
import { AsyncPipe } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { OnlineService } from "app/online/service/online.service";

@Component({
  selector: "app-delete-public-theme",
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    AsyncPipe,
    MatIconModule,
  ],
  templateUrl: "./delete-public-theme.component.html",
  styleUrls: ["./delete-public-theme.component.scss"],
})
export class DeletePublicThemeComponent {
  publicTheme = this.publicThemeService.getPublicTheme(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  form = this.formBuilder.group({
    id: this.publicTheme.id,
    name: [{ value: this.publicTheme.name, disabled: true }, Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private publicThemeService: PublicThemeService,
    private assignmentService: AssignmentService,
    private router: Router,
    private onlineService: OnlineService,
    private activatedRoute: ActivatedRoute,
  ) {}

  onSubmit(publicTheme: PublicThemeInterface): void {
    //delete room
    const isDeleted = this.publicThemeService.deletePublicTheme(publicTheme.id);

    if (isDeleted) {
      //Remove the public theme in the existing assignments
      this.assignmentService.removeAssignmentsPublicThemeProperty(publicTheme.id);
    }

    //navigate to parent
    this.router.navigate(["../.."], {
      relativeTo: this.activatedRoute,
    });
  }
}
