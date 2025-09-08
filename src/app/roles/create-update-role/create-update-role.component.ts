import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AssignTypeInterface } from 'app/assigntype/model/assigntype.model';
import { AssignTypeService } from 'app/assigntype/service/assigntype.service';
import { ConfigService } from 'app/config/service/config.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AsyncPipe } from '@angular/common';
import { AutoFocusDirective } from '../../directives/autofocus/autofocus.directive';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AssignTypeNamePipe } from 'app/assigntype/pipe/assign-type-name.pipe';
import { MatIconModule } from '@angular/material/icon';
import { OnlineService } from 'app/online/service/online.service';
import { format } from 'date-fns';
import { RoleInterface } from '../model/role.model';
import {
  bn,
  ca,
  de,
  el,
  enGB,
  es,
  fr,
  hi,
  hr,
  it,
  ja,
  ko,
  nl,
  pl,
  pt,
  ro,
  ru,
  tr,
  zhCN
} from 'date-fns/locale';

@Component({
  selector: 'app-create-update-role',
  templateUrl: './create-update-role.component.html',
  styleUrls: ['./create-update-role.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    AutoFocusDirective,
    MatCheckboxModule,
    MatButtonModule,
    RouterLink,
    AssignTypeNamePipe,
    MatIconModule,
    AsyncPipe
  ]
})
export class CreateUpdateRoleComponent {
  private formBuilder = inject(FormBuilder);
  private configService = inject(ConfigService);
  private assignTypeService = inject(AssignTypeService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private translocoService = inject(TranslocoService);
  private onlineService = inject(OnlineService);

  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  r = this.configService.getRole(this.activatedRoute.snapshot.params.id);

  netStatusOffline$ = this.onlineService.netStatusOffline$;

  locales = {
    bn,
    ca,
    de,
    el,
    en: enGB,
    es,
    fr,
    hi,
    hr,
    it,
    ja,
    ko,
    nl,
    pl,
    pt,
    ro,
    ru,
    tr,
    zhCN
  };

  isUpdate = this.r.id ? true : false;

  // Months are 0 index based
  monday = format(new Date(2024, 4, 6), 'EEEE', {
    locale: this.locales[this.translocoService.getActiveLang()]
  });

  tuesday = format(new Date(2024, 4, 7), 'EEEE', {
    locale: this.locales[this.translocoService.getActiveLang()]
  });
  wednesday = format(new Date(2024, 4, 8), 'EEEE', {
    locale: this.locales[this.translocoService.getActiveLang()]
  });
  thursday = format(new Date(2024, 4, 9), 'EEEE', {
    locale: this.locales[this.translocoService.getActiveLang()]
  });
  friday = format(new Date(2024, 4, 10), 'EEEE', {
    locale: this.locales[this.translocoService.getActiveLang()]
  });
  saturday = format(new Date(2024, 4, 11), 'EEEE', {
    locale: this.locales[this.translocoService.getActiveLang()]
  });
  sunday = format(new Date(2024, 4, 12), 'EEEE', {
    locale: this.locales[this.translocoService.getActiveLang()]
  });

  form = this.formBuilder.group({
    id: this.r.id,
    name: [this.r.name, { validators: Validators.required }],
    assignTypesId: [this.r.assignTypesId, Validators.required],
    monday: [this.r.friday],
    tuesday: [this.r.tuesday],
    wednesday: [this.r.wednesday],
    thursday: [this.r.thursday],
    friday: [this.r.friday],
    saturday: [this.r.saturday],
    sunday: [this.r.sunday]
  });

  //includes
  isChecked(id: string): boolean {
    const assignTypesIdList = this.form.get('assignTypesId').value as string[];
    return assignTypesIdList.includes(id);
  }

  //Add or remove
  changeCheckbox(assignTypeId: string) {
    const atCtrl = this.form.get('assignTypesId');
    let assignTypesId: string[] = atCtrl.value;
    const index = assignTypesId.indexOf(assignTypeId);
    if (index > -1) {
      assignTypesId = assignTypesId.filter(atId => atId !== assignTypeId);
    } else {
      assignTypesId.push(assignTypeId);
    }
    atCtrl.patchValue(assignTypesId);
  }

  onSubmit() {
    const value = this.form.value as RoleInterface;

    if (this.isUpdate) {
      this.configService.updateRole(value);
    } else {
      this.configService.addRole(value);
    }
    //navigate to parent
    const route = this.isUpdate ? '../..' : '..';

    this.router.navigate([route], {
      relativeTo: this.activatedRoute
    });
  }
}
