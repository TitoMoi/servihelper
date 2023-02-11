import { Pipe, PipeTransform } from "@angular/core";
import { ParticipantService } from "../service/participant.service";

@Pipe({
  name: "participantPipe",
})
export class ParticipantPipe implements PipeTransform {
  constructor(private participantService: ParticipantService) {}
  /**Given the id of the participant return the name */
  transform(id: string): string {
    return this.participantService.getParticipant(id)?.name;
  }
}
