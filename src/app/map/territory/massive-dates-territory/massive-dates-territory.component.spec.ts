import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MassiveDatesTerritoryComponent } from "./massive-dates-territory.component";

describe("MassiveDatesTerritoryComponent", () => {
  let component: MassiveDatesTerritoryComponent;
  let fixture: ComponentFixture<MassiveDatesTerritoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MassiveDatesTerritoryComponent],
    });
    fixture = TestBed.createComponent(MassiveDatesTerritoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
