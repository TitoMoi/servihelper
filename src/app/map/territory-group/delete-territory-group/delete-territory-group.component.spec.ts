import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DeleteTerritoryGroupComponent } from "./delete-territory-group.component";

describe("DeleteTerritoryGroupComponent", () => {
  let component: DeleteTerritoryGroupComponent;
  let fixture: ComponentFixture<DeleteTerritoryGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DeleteTerritoryGroupComponent],
    });
    fixture = TestBed.createComponent(DeleteTerritoryGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
