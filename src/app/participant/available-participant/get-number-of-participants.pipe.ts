import { Pipe, PipeTransform, inject } from '@angular/core';
import { ParticipantService } from 'app/participant/service/participant.service';

type participantAssignTypeOptionType = 'principal' | 'assistant';

@Pipe({
  name: 'getNumberOfParticipantsPipe',
  standalone: true
})
export class GetNumberOfParticipantsPipe implements PipeTransform {
  private participantService = inject(ParticipantService);

  transform(atId: string, optionType: participantAssignTypeOptionType = 'principal'): number {
    const participants = this.participantService.getParticipants();
    let count = 0;
    for (const p of participants) {
      if (
        p.available &&
        p.assignTypes.some(
          a =>
            a.assignTypeId === atId &&
            (optionType === 'principal' ? a.canPrincipal : a.canAssistant)
        )
      ) {
        count++;
      }
    }
    return count;
  }
}
