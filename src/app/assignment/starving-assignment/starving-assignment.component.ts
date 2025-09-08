import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { StarvingAssignmentsDataContext } from '../model/assignment.model';
@Component({
  selector: 'app-starving-assignment',
  imports: [TranslocoDirective, MatIconModule, MatDialogModule],
  templateUrl: './starving-assignment.component.html',
  styleUrl: './starving-assignment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarvingAssignmentComponent {
  private starvingDataContext = inject<StarvingAssignmentsDataContext>(MAT_DIALOG_DATA);

  participants = this.starvingDataContext.participants;
}
