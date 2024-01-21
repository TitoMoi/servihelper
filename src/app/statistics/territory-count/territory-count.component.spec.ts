import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TerritoryCountComponent } from "./territory-count.component";

describe("TerritoryCountComponent", () => {
  let component: TerritoryCountComponent;
  let fixture: ComponentFixture<TerritoryCountComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TerritoryCountComponent],
    });
    fixture = TestBed.createComponent(TerritoryCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
