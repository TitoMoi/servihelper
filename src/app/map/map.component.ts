import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";

import { MatButtonModule } from "@angular/material/button";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import { MatRadioGroup, MatRadioModule } from "@angular/material/radio";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Subscription } from "rxjs";

@Component({
  selector: "app-map",
  standalone: true,
  imports: [
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatRadioModule,
    RouterOutlet,
    ReactiveFormsModule
],
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("matRadioGroup") matRadioGroup: MatRadioGroup;
  selectedRadioOptionControl = new FormControl();

  subscription = new Subscription();
  constructor(private cdr: ChangeDetectorRef, private router: Router) {}
  ngOnInit(): void {
    this.subscription.add(
      this.selectedRadioOptionControl.valueChanges.subscribe((value) =>
        value === "1"
          ? this.router.navigate(["map/territory"])
          : this.router.navigate(["map/territoryGroup"])
      )
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
