//src/app/directives/draggable.directive.ts
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appDraggable]'
})
export class DraggableDirective {
  private pos1 = 0;
  private pos2 = 0;
  private pos3 = 0;
  private pos4 = 0;

  constructor(private el: ElementRef) {
    this.el.nativeElement.style.position = 'fixed';
    this.el.nativeElement.style.cursor = 'move';
  }

  // ✅ Desktop (mouse)
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.pos3 = event.clientX;
    this.pos4 = event.clientY;
    document.onmouseup = this.closeDragElement;
    document.onmousemove = this.elementDrag.bind(this);
  }

  elementDrag(event: MouseEvent) {
    event.preventDefault();
    this.pos1 = this.pos3 - event.clientX;
    this.pos2 = this.pos4 - event.clientY;
    this.pos3 = event.clientX;
    this.pos4 = event.clientY;
    this.el.nativeElement.style.top = (this.el.nativeElement.offsetTop - this.pos2) + "px";
    this.el.nativeElement.style.left = (this.el.nativeElement.offsetLeft - this.pos1) + "px";
  }

  // ✅ Mobile (touch)
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.pos3 = event.touches[0].clientX;
    this.pos4 = event.touches[0].clientY;
    document.ontouchend = this.closeDragElement;
    document.ontouchmove = this.elementTouchDrag.bind(this);
  }

  elementTouchDrag(event: TouchEvent) {
    this.pos1 = this.pos3 - event.touches[0].clientX;
    this.pos2 = this.pos4 - event.touches[0].clientY;
    this.pos3 = event.touches[0].clientX;
    this.pos4 = event.touches[0].clientY;
    this.el.nativeElement.style.top = (this.el.nativeElement.offsetTop - this.pos2) + "px";
    this.el.nativeElement.style.left = (this.el.nativeElement.offsetLeft - this.pos1) + "px";
  }

  closeDragElement = () => {
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}
