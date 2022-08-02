import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: "[appautofocus]",
})
export class AutoFocusDirective implements OnInit {
  constructor(private host: ElementRef) {}

  ngOnInit(): void {
    this.host.nativeElement.focus();
  }
}
