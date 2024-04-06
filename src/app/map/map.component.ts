import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";

import { MatButtonModule } from "@angular/material/button";
import {
  ActivationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { TranslocoDirective } from "@ngneat/transloco";
import { MatRadioGroup, MatRadioModule } from "@angular/material/radio";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Subscription, filter, map } from "rxjs";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: "app-map",
  standalone: true,
  imports: [
    TranslocoDirective,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatRadioModule,
    RouterOutlet,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("matRadioGroup") matRadioGroup: MatRadioGroup;
  selectedRadioOptionControl = new FormControl();

  // At level 3 we are inside the create/update/delete...
  numberOfChildren$ = this.router.events.pipe(
    filter((event) => event instanceof ActivationEnd),
    map(
      () =>
        this.router.getCurrentNavigation().extractedUrl.root.children.primary.segments.length <
        3,
    ),
  );

  subscription = new Subscription();

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.selectedRadioOptionControl.valueChanges.subscribe((value) =>
        value === "1"
          ? this.router.navigate(["/map/territory"])
          : this.router.navigate(["/map/territoryGroup"]),
      ),
    );
  }

  ngAfterViewInit(): void {
    this.selectedRadioOptionControl.patchValue("1"); //default navigation
    this.cdr.detectChanges();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
