import { Directive, ElementRef, OnInit, OnDestroy, inject, Input } from '@angular/core';

@Directive({
  selector: '[appScrollAnimate]',
  standalone: true
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private observer!: IntersectionObserver;

  @Input() animateDelay = 0;
  @Input() animateThreshold = 0.1;

  ngOnInit(): void {
    this.el.nativeElement.style.opacity = '0';
    this.el.nativeElement.style.transform = 'translateY(20px)';
    this.el.nativeElement.style.transition = `opacity 0.6s ease-out ${this.animateDelay}ms, transform 0.6s ease-out ${this.animateDelay}ms`;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            (entry.target as HTMLElement).style.opacity = '1';
            (entry.target as HTMLElement).style.transform = 'translateY(0)';
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: this.animateThreshold }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
