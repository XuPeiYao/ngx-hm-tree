import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';

import { elementsFromPoint } from '../ts/elementsFromPoint';

@Directive({
  selector: '[hm-sortable]'
})
export class HmDirective implements AfterViewInit {
  @Input('hm-sortable') sourceObj: any;

  @Input('elms-selector') elmsSelector: Function;
  @Input('move-selector') moveSelector: Function;

  @Input('select-style') selectStyle: any;
  @Input('moving-style') movingStyle: any;
  @Output('sort-complete') sortComplete = new EventEmitter();


  private elms = [];
  private storeStyle = {};
  private selectNode;
  private selectIndex;
  private nowIndex;
  private disY;

  constructor(private parentELm: ElementRef) { }

  ngAfterViewInit(): void {
    this.setSelectorElm();
    // this.elms = this.parentELm.nativeElement.querySelectorAll(this.elmsSelector);
    this.bindHammar(this.getMoveSelector());
  }

  private getMoveSelector() {
    const movesEl = [];
    this.parentELm.nativeElement.childNodes.forEach((elm: Element) => {
      Array.from(elm.childNodes).forEach((e: Element) => {
        if (this.moveSelector(e)) {
          movesEl.push(e);
        }
      });
    });
    // console.log(movesEl);

    return movesEl;
  }

  private setSelectorElm() {
    this.elms.length = 0;
    this.parentELm.nativeElement.childNodes.forEach((e: Element) => {
      if (this.elmsSelector(e)) {
        this.elms.push(e);
      }
    });
    // console.log(this.elms);
  }

  private bindHammar(elms) {
    elms.forEach(el => {
      const mc = new Hammer(el);
      // let the pan gesture support all directions.
      // this will block the vertical scrolling on a touch-device while on the element
      mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

      mc.on('panstart', (event: any) => {
        event.preventDefault();
        // console.log(this.elms);
        // console.log(event);
        this.selectIndex = this.nowIndex = +event.target.parentNode.attributes.index.value;
        // console.log(this.nowIndex);
        // set choiceNode to this start tag
        this.selectNode = this.elms[this.nowIndex];
        // get distance from this tag's origin
        this.disY = Math.abs(this.selectNode.offsetTop - event.center.y);
        // set this elem style
        Object.assign(this.selectNode.style, {
          pointerEvents: 'none'
        });

        // clone a new tag call sort_clone_obj and hidden it
        this.createMovingTag();

        // store the choiceTag original css
        Object.keys(this.selectStyle).forEach((key) => {
          this.storeStyle[key] = this.selectNode.style[key];
        });
        // change changeStyle
        Object.assign(this.selectNode.style, this.selectStyle);
      });

      mc.on('panmove', (event) => {
        event.preventDefault();

        const e = document.getElementById('sort_clone_obj');
        Object.assign(e.style, {
          // transform: `translate(${event.deltaX}px, ${event.deltaY}px)`,
          pointerEvents: 'none',
          top: `${event.center.y - this.disY}px`,
          position: 'absolute',
          display: '',
          zIndex: '3'
        });

        elementsFromPoint(event.center.x, event.center.y, (item: Element) => {
          return item.tagName === 'LI' && item.parentNode === this.parentELm.nativeElement;
        }).then((getElm: any) => {
          const moveI = getElm.attributes.index.value;

          const tmp = this.sourceObj[this.nowIndex];
          this.sourceObj.splice(this.nowIndex, 1);
          this.sourceObj.splice(moveI, 0, tmp);

          this.nowIndex = moveI;
        });
      });

      mc.on('panend', (event) => {
        this.selectNode.style.pointerEvents = 'inherit';
        document.getElementById('sort_clone_obj').remove();
        Object.assign(this.elms[this.selectIndex].style, this.storeStyle);
        this.setSelectorElm();

        this.sortComplete.emit(this.sourceObj);

      });
    });
  }

  // clone a new tag call sort_clone_obj and hidden it
  private createMovingTag() {
    const cln = this.selectNode.cloneNode(true);
    cln.id = 'sort_clone_obj';
    const style = {
      position: 'absolute',
      display: 'none'
    };
    Object.assign(cln.style, style, this.movingStyle);
    this.parentELm.nativeElement.insertBefore(cln, this.selectNode);
  }
}
