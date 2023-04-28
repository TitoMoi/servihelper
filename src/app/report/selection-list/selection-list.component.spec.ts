import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SelectionListComponent } from "./selection-list.component";

describe("SelectionListComponent", () => {
  let component: SelectionListComponent;
  let fixture: ComponentFixture<SelectionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
