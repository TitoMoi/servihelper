import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { SharedService } from 'app/globals/services/shared.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
  imports: [TranslocoModule]
})
export class QuestionComponent {
  private sharedService = inject(SharedService);

  appVersion = this.sharedService.appVersion;
}
