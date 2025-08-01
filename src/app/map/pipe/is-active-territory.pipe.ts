import { Pipe, PipeTransform, inject } from '@angular/core';

import { TerritoryService } from '../territory/service/territory.service';

import { TerritoryContextInterface } from '../model/map.model';

@Pipe({
  name: 'isActiveTerritoryPipe',
  standalone: true
})
export class IsActiveTerritoryPipe implements PipeTransform {
  private territoryService = inject(TerritoryService);

  transform(t: TerritoryContextInterface): boolean {
    return this.territoryService.isActiveTerritory(t);
  }
}
