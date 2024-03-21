import { Component, Input } from "@angular/core";

import { MatExpansionModule } from "@angular/material/expansion";
import { TranslocoDirective } from "@ngneat/transloco";

@Component({
  selector: "app-fake-accordion",
  standalone: true,
  imports: [MatExpansionModule, TranslocoDirective],
  templateUrl: "./fake-accordion.component.html",
  styleUrl: "./fake-accordion.component.scss",
})
export class FakeAccordionComponent {
  @Input() titleKey = "";
}
