import { AfterViewInit, Directive, ElementRef, Input, QueryList } from '@angular/core';

@Directive({
  selector: '[hm-sortable-elms]'
})
export class SortableElmsDirective implements AfterViewInit {

  @Input('hm-sortable-elms') elms: QueryList<ElementRef>;
  constructor() {
  }

  ngAfterViewInit() {
    console.log(this.elms);


  }

}
