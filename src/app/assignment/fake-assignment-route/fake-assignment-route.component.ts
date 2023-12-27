import { AsyncPipe } from "@angular/common";
import { Component, ElementRef, ViewChild } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { map } from "rxjs";

@Component({
  selector: "app-fake-assignment-route",
  standalone: true,
  imports: [RouterModule, AsyncPipe],
  templateUrl: "./fake-assignment-route.component.html",
  styleUrl: "./fake-assignment-route.component.scss",
})
export class FakeAssignmentRouteComponent {
  @ViewChild("fakeCancelBtn", { read: ElementRef }) cancelBtn: ElementRef;

  navEnd$ = this.router.events.pipe(map((e) => e.type));

  constructor(private router: Router) {
    this.router.navigateByUrl("/assignment", {
      skipLocationChange: true,
    });
  }
}
