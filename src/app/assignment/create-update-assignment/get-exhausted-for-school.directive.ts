/* eslint-disable complexity */
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { Directive, ElementRef, HostListener, Injector, Input, inject } from "@angular/core";
import { CloseAssignmentsComponent } from "./close-assignments/close-assignments.component";
import { ParticipantInterface } from "../../participant/model/participant.model";
import { parseISO } from "date-fns";
import { AssignmentService } from "app/assignment/service/assignment.service";
import { ConfigService } from "app/config/service/config.service";
import { AssignmentInterface } from "app/assignment/model/assignment.model";
import { AssignTypeService } from "app/assigntype/service/assigntype.service";
import { ExhaustedOverlayDataInterface } from "app/assignment/model/assignment.model";
import { CLOSE_ASSIGNMENTS_DATA_TOKEN } from "app/assignment/model/assignment.model";

@Directive({
  selector: "[getExhaustedForSchoolOverlay]",
  standalone: true,
})
export class GetExhaustedForSchoolDirective {
  @Input() getExhaustedForSchoolOverlay: ExhaustedOverlayDataInterface;
  overlayRef: OverlayRef;

  foundAssignments: AssignmentInterface[] = [];

  @HostListener("mouseover", ["$event"])
  public onHover(): void {
    this.getExhaustedForSchool(this.getExhaustedForSchoolOverlay.participant);
    this.createOverlay();
  }

  @HostListener("mouseout", ["$event"])
  public onListenerFocusOut(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
    }
  }

  /* scrollStrategy: this.overlay.scrollStrategies.reposition(), */

  overlay = inject(Overlay);
  elementRef = inject(ElementRef);
  assignmentService: AssignmentService = inject(AssignmentService);
  configService: ConfigService = inject(ConfigService);
  assignTypeService: AssignTypeService = inject(AssignTypeService);

  getExhaustedForSchool(p: ParticipantInterface) {
    let currentDate: Date = this.getExhaustedForSchoolOverlay.currentDate;
    const closeOthersDays = this.configService.getConfig().closeToOthersDays;

    //If we edit an assignment, we get the string iso instead of a real date
    if (typeof currentDate === "string") currentDate = parseISO(currentDate);

    //Get all the assignments before and after the days treshold, its 1 based index
    const allDays = this.assignmentService.getAllAssignmentsByDaysBeforeAndAfter(
      currentDate,
      closeOthersDays,
    );

    for (const assign of allDays) {
      if (
        this.assignTypeService.isOfTypeAssignTypes(
          this.assignTypeService.getAssignType(assign.assignType).type,
        ) &&
        (assign.principal === p.id || assign.assistant === p.id)
      ) {
        this.foundAssignments.push(assign);
      }
    }
  }

  createOverlay(): void {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withPositions([
          {
            originX: "end",
            originY: "top",
            overlayX: "center",
            overlayY: "top",
          },
        ]),
    });
    const portalInjector = Injector.create({
      providers: [{ provide: CLOSE_ASSIGNMENTS_DATA_TOKEN, useValue: this.foundAssignments }],
    });

    const closeAssignmentsComponent = new ComponentPortal(
      CloseAssignmentsComponent,
      null,
      portalInjector,
    );
    this.overlayRef.attach(closeAssignmentsComponent);
  }
}
