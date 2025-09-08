import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslocoLocaleModule } from '@jsverse/transloco-locale';

import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { RoomNamePipe } from 'app/room/pipe/room-name.pipe';
import { RoomPipe } from 'app/room/pipe/room.pipe';

@Component({
  selector: 'app-info-assignment',
  templateUrl: './info-assignment.component.html',
  styleUrls: ['./info-assignment.component.scss'],
  imports: [
    TranslocoModule,
    MatDialogModule,
    MatIconModule,
    TranslocoLocaleModule,
    RoomPipe,
    RoomNamePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoAssignmentComponent {
  data = inject(MAT_DIALOG_DATA);
}
