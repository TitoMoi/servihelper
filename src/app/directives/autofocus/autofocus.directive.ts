import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[appautofocus]',
  standalone: true
})
export class AutoFocusDirective implements OnInit {
  private host = inject(ElementRef);

  @Input() appautofocus = true;

  ngOnInit(): void {
    if (this.appautofocus) this.host.nativeElement.focus();
  }
}
