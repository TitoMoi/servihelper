import { ElementRef } from "@angular/core";
import { AutoFocusDirective } from "./autofocus.directive";

describe("AutofocusDirective", () => {
  it("should create an instance", () => {
    const elem = new HTMLInputElement();
    const elementRef = new ElementRef(elem);
    const directive = new AutoFocusDirective(elementRef);
    expect(directive).toBeTruthy();
  });
});
