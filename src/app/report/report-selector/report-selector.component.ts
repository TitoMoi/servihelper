import { AssignTypeInterface } from 'app/assigntype/model/assigntype.model';
import { AssignTypeService } from 'app/assigntype/service/assigntype.service';
import { RoomInterface } from 'app/room/model/room.model';
import { RoomService } from 'app/room/service/room.service';

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatOption, MatOptionModule } from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerInputEvent,
  MatDatepickerModule
} from '@angular/material/datepicker';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { TranslocoService, TranslocoModule } from '@ngneat/transloco';
import { MultipleImageAssignmentComponent } from '../multiple-image-assignment/multiple-image-assignment.component';
import { SelectionListHorComponent } from '../selection-list-hor/selection-list-hor.component';
import { SelectionListComponent } from '../selection-list/selection-list.component';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SortService } from 'app/services/sort.service';
import { AssignTypeNamePipe } from 'app/assigntype/pipe/assign-type-name.pipe';
import { RoomNamePipe } from 'app/room/pipe/room-name.pipe';
import { ConfigService } from 'app/config/service/config.service';
import { ConfigInterface } from 'app/config/model/config.model';
import { RoleInterface } from 'app/roles/model/role.model';
import { Observable, Subscription, map } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-report-selector',
  templateUrl: './report-selector.component.html',
  styleUrls: ['./report-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
    SelectionListComponent,
    SelectionListHorComponent,
    MultipleImageAssignmentComponent,
    AssignTypeNamePipe,
    RoomNamePipe,
    AsyncPipe
  ]
})
export class ReportSelectorComponent implements OnInit, AfterViewInit {
  private assignTypeService = inject(AssignTypeService);
  private roomService = inject(RoomService);
  private translocoService = inject(TranslocoService);
  private sortService = inject(SortService);
  private formBuilder = inject(UntypedFormBuilder);
  private configService = inject(ConfigService);
  private cdr = inject(ChangeDetectorRef);

  //Angular material datepicker hacked
  @ViewChild(MatDatepicker) datePickerRef: MatDatepicker<Date>;

  @ViewChild('assignTypesSelect') assignTypesSelectRef: MatSelect;
  @ViewChild('roomsSelect') roomsSelectRef: MatSelect;
  @ViewChild('orderSelect') order: MatSelect;

  //props for datepicker hack
  closeOnSelected = false;
  init = new Date();
  selectedDates = [];
  timeoutRef;
  resetModel = undefined;
  timeoutExecuted = true; //first time
  //end of props for datepicker hack

  config$: Observable<ConfigInterface> = this.configService.config$;
  roles$: Observable<RoleInterface[]> = this.config$.pipe(map(config => config.roles));
  isAdmin = false;

  allowedAssignTypesIds = [];

  rooms: RoomInterface[] = this.roomService.getRooms().sort((a, b) => (a.order > b.order ? 1 : -1));

  assignTypes: AssignTypeInterface[] = this.assignTypeService
    .getAssignTypes()
    .sort((a, b) => (a.order > b.order ? 1 : -1));

  isMultipleDates = false;

  orderOptions: string[] = ['Asc', 'Desc'];

  templateOptions: string[] = [
    this.translocoService.translate('ASSIGN_SELECTION_ASSIGNTYPES_TEMPLATE_VERTICAL'),
    this.translocoService.translate('ASSIGN_SELECTION_ASSIGNTYPES_TEMPLATE_HORIZONTAL'),
    this.translocoService.translate('ASSIGN_SELECTION_ASSIGNTYPES_TEMPLATE_MULTIPLE_SHEET')
  ];

  selectionForm: UntypedFormGroup = this.formBuilder.group({
    dates: [undefined, Validators.required],
    rooms: [undefined, Validators.required],
    assignTypes: [undefined, Validators.required],
    order: [undefined, Validators.required],
    template: [undefined, Validators.required]
  });

  subscription = new Subscription();
  ngOnInit(): void {
    this.selectionForm.markAllAsTouched();

    if (this.configService.isAdminRole()) {
      this.isAdmin = true;
      this.allowedAssignTypesIds = this.getAllAssignTypesIds();
    } else {
      this.isAdmin = false;
      this.allowedAssignTypesIds = this.configService.getRole(
        this.configService.role
      ).assignTypesId;
    }

    this.configService.role$.subscribe(() => {
      if (this.configService.isAdminRole()) {
        this.isAdmin = true;
        this.allowedAssignTypesIds = this.getAllAssignTypesIds();
      } else {
        this.isAdmin = false;
        this.allowedAssignTypesIds = this.configService.getRole(
          this.configService.role
        ).assignTypesId;
      }
      this.selectFilteredAssignTypes();
      this.cdr.detectChanges();
    });
  }

  selectFilteredAssignTypes() {
    for (const o of this.assignTypesSelectRef.options) {
      o.deselect();
    }

    const filteredOptions = this.assignTypesSelectRef.options.filter((item: MatOption) =>
      this.allowedAssignTypesIds.includes(item.value)
    );
    for (const o of filteredOptions) {
      o.select();
    }
  }

  ngAfterViewInit() {
    this.selectFilteredAssignTypes();

    this.roomsSelectRef.options.forEach((item: MatOption) => item.select());
    this.order.options.first.select();
    this.cdr.detectChanges();
  }

  //first load or Admin
  getAllAssignTypesIds() {
    return this.assignTypeService.getAssignTypes().map(at => at.id);
  }

  //********* DATEPICKER HACK *************

  //for Datepicker hack
  public dateClass = (date: Date) => {
    if (this.findDate(date) !== -1) {
      return ['selected'];
    }
    return [];
  };

  //for Datepicker hack
  public dateChanged(event: MatDatepickerInputEvent<Date>): void {
    if (event.value && this.timeoutExecuted) {
      this.timeoutExecuted = false;
      const date = event.value;
      const index = this.findDate(date);
      if (index === -1) {
        this.selectedDates.push(date);
      } else {
        this.selectedDates.splice(index, 1);
      }
      this.resetModel = new Date(0);
      //prepare sorted dates for the reports and new reference for the input components
      this.selectedDates = [...this.selectedDates.sort(this.sortService.sortDates)];

      if (!this.closeOnSelected) {
        const closeFn = this.datePickerRef.close;
        this.datePickerRef.close = () => {};
        // eslint-disable-next-line no-underscore-dangle
        this.datePickerRef[
          // eslint-disable-next-line @typescript-eslint/dot-notation
          '_componentRef'
        ].instance._calendar.monthView._createWeekCells();

        this.timeoutRef = setTimeout(() => {
          this.datePickerRef.close = closeFn;
          this.timeoutExecuted = true;
        });
      }
    }
  }

  //for Datepicker hack
  public remove(date: Date): void {
    const index = this.findDate(date);
    this.selectedDates.splice(index, 1);
  }

  //for Datepicker hack
  private findDate(date: Date): number {
    return this.selectedDates.map(m => +m).indexOf(+date);
  }
}
