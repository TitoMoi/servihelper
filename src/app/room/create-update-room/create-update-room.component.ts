import { ParticipantService } from "app/participant/service/participant.service";
import { RoomService } from "app/room/service/room.service";

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  UntypedFormBuilder,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { AutoFocusDirective } from "../../directives/autofocus/autofocus.directive";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { TranslocoModule, TranslocoService } from "@ngneat/transloco";
import { MatIconModule } from "@angular/material/icon";
import { AsyncPipe } from "@angular/common";
import { OnlineService } from "app/online/service/online.service";

@Component({
    selector: "app-create-update-room",
    templateUrl: "./create-update-room.component.html",
    styleUrls: ["./create-update-room.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TranslocoModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        AutoFocusDirective,
        MatButtonModule,
        RouterLink,
        MatIconModule,
        AsyncPipe,
    ]
})
export class CreateUpdateRoomComponent {
  private formBuilder = inject(UntypedFormBuilder);
  private roomService = inject(RoomService);
  private participantService = inject(ParticipantService);
  private router = inject(Router);
  private translocoService = inject(TranslocoService);
  private activatedRoute = inject(ActivatedRoute);
  private onlineService = inject(OnlineService);

  r = this.roomService.getRoom(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  isUpdate = this.r ? true : false;

  name = this.isUpdate
    ? this.r.name
      ? this.r.name
      : this.translocoService.translate(this.r.tKey)
    : null;

  form = this.formBuilder.group({
    id: this.r?.id,
    name: new FormControl(this.name, { validators: Validators.required, updateOn: "blur" }),
    type: [this.r ? this.r.type : "other"],
    order: [this.r?.order, Validators.required],
  });

  onSubmit(): void {
    const room = this.form.value;
    if (this.isUpdate) {
      this.roomService.updateRoom(room);
    } else {
      //create the room
      const id = this.roomService.createRoom(room);
      //Create the room reference for all the participants
      this.participantService.addRoom(id);
    }

    //navigate to parent
    const route = this.isUpdate ? "../.." : "..";
    this.router.navigate([route], {
      relativeTo: this.activatedRoute,
    });
  }
}
