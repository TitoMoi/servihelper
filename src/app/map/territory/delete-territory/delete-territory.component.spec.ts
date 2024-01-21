import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DeleteMapComponent } from "./delete-map.component";

describe("DeleteMapComponent", () => {
  let component: DeleteMapComponent;
  let fixture: ComponentFixture<DeleteMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DeleteMapComponent],
    });
    fixture = TestBed.createComponent(DeleteMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
