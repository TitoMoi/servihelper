import { RoomInterface } from 'app/room/model/room.model';
import { RoomService } from 'app/room/service/room.service';

import { Component, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoModule } from '@ngneat/transloco';
import { RoomNamePipe } from './pipe/room-name.pipe';
import { OnlineService } from 'app/online/service/online.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  imports: [
    TranslocoModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    RoomNamePipe,
    AsyncPipe
  ]
})
export class RoomComponent implements OnInit {
  private roomService = inject(RoomService);
  private onlineService = inject(OnlineService);

  rooms: RoomInterface[];

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  ngOnInit(): void {
    this.rooms = this.roomService.getRooms().sort((a, b) => (a.order > b.order ? 1 : -1));
  }
}
