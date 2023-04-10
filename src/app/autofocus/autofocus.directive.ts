import { Directive, ElementRef, Input, OnInit } from "@angular/core";

@Directive({
  selector: "[appautofocus]",
})
export class AutoFocusDirective implements OnInit {
  @Input() appautofocus = true;
  constructor(private host: ElementRef) {}

  ngOnInit(): void {
    if (this.appautofocus) this.host.nativeElement.focus();
  }
}
