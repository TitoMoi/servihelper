import { Component, Input } from '@angular/core';

import { MatExpansionModule } from '@angular/material/expansion';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-fake-accordion',
  imports: [MatExpansionModule, TranslocoDirective],
  templateUrl: './fake-accordion.component.html',
  styleUrl: './fake-accordion.component.scss'
})
export class FakeAccordionComponent {
  @Input() titleKey = '';
}
