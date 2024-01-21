import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ReturnTerritoryComponent } from "./return-territory.component";

describe("ReturnTerritoryComponent", () => {
  let component: ReturnTerritoryComponent;
  let fixture: ComponentFixture<ReturnTerritoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReturnTerritoryComponent],
    });
    fixture = TestBed.createComponent(ReturnTerritoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
