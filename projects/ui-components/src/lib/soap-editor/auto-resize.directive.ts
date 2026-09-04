import { Directive, ElementRef, HostListener, OnInit, AfterViewChecked } from '@angular/core';

@Directive({
  selector: '[autoResize]',
  standalone: true
})
export class AutoResizeDirective implements OnInit, AfterViewChecked {
  constructor(private el: ElementRef) {}

  @HostListener('input')
  onInput() {
    this.resize();
  }

  ngOnInit() {
    setTimeout(() => this.resize(), 50);
  }

  ngAfterViewChecked() {
    // Ensure resizing applies if content is updated programmatically
    this.resize();
  }

  private resize() {
    const el = this.el.nativeElement;
    // Save current scroll position because changing height to auto can cause scroll jumping
    const scrollPos = window.scrollY;
    
    el.style.height = 'auto';
    el.style.overflow = 'hidden';
    el.style.height = el.scrollHeight + 'px';
    
    // Restore scroll
    window.scrollTo(window.scrollX, scrollPos);
  }
}
