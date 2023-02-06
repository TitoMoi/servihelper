import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CreateUpdateAssignmentComponent } from "./create-update-assignment.component";

describe("CreateAssignmentComponent", () => {
  let component: CreateUpdateAssignmentComponent;
  let fixture: ComponentFixture<CreateUpdateAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateUpdateAssignmentComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUpdateAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
