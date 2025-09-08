import { AssignmentService } from 'app/assignment/service/assignment.service';
import { ParticipantService } from 'app/participant/service/participant.service';
import { RoomInterface } from 'app/room/model/room.model';
import { RoomService } from 'app/room/service/room.service';

import { Component, inject } from '@angular/core';
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { TranslocoModule } from '@jsverse/transloco';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OnlineService } from 'app/online/service/online.service';

@Component({
  selector: 'app-delete-room',
  templateUrl: './delete-room.component.html',
  styleUrls: ['./delete-room.component.css'],
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    AsyncPipe,
    MatIconModule
  ]
})
export class DeleteRoomComponent {
  private formBuilder = inject(UntypedFormBuilder);
  private roomService = inject(RoomService);
  private participantService = inject(ParticipantService);
  private assignmentService = inject(AssignmentService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private onlineService = inject(OnlineService);

  room = this.roomService.getRoom(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  form = this.formBuilder.group({
    id: this.room.id,
    name: [{ value: this.room.name, disabled: true }, Validators.required]
  });

  onSubmit(room: RoomInterface): void {
    //delete room
    this.roomService.deleteRoom(room.id);

    //delete from participants the room reference
    this.participantService.deleteRoom(room.id);

    //delete all assignments that have the room
    this.assignmentService.deleteAssignmentsByRoom(room.id);

    //navigate to parent
    this.router.navigate(['../..'], {
      relativeTo: this.activatedRoute
    });
  }
}
