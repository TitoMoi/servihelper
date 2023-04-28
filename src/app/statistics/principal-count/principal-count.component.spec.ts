import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PrincipalCountComponent } from "./principal-count.component";

describe("PrincipalCountComponent", () => {
  let component: PrincipalCountComponent;
  let fixture: ComponentFixture<PrincipalCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrincipalCountComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrincipalCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
