/* eslint-disable complexity */
export interface RoleInterface {
  id: string;
  name: string;
  assignTypesId: string[];
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export class RoleClass {
  id: string;
  name: string;
  assignTypesId: string[];
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;

  constructor(r: RoleInterface) {
    if (r) {
      this.id = r.id;
      this.name = r.name;
      this.assignTypesId = r.assignTypesId;
      this.monday = r.monday ?? true;
      this.tuesday = r.tuesday ?? true;
      this.wednesday = r.wednesday ?? true;
      this.thursday = r.thursday ?? true;
      this.friday = r.friday ?? true;
      this.saturday = r.saturday ?? true;
      this.sunday = r.sunday ?? true;
    } else {
      this.assignTypesId = [];
      this.monday = true;
      this.tuesday = true;
      this.wednesday = true;
      this.thursday = true;
      this.friday = true;
      this.saturday = true;
      this.sunday = true;
    }
  }
}

export interface RoleTableInterface {
  id: string;
  name: string;
}
