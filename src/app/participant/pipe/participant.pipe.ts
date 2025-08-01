import { Pipe, PipeTransform, inject } from '@angular/core';
import { ParticipantInterface } from '../model/participant.model';
import { ParticipantService } from '../service/participant.service';

@Pipe({
  name: 'participantPipe',
  standalone: true
})
export class ParticipantPipe implements PipeTransform {
  private participantService = inject(ParticipantService);

  /**Given the id of the participant return the name */
  transform(id: string): ParticipantInterface {
    return this.participantService.getParticipant(id);
  }
}
