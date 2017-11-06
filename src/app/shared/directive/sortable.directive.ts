import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, NgZone, Output } from '@angular/core';

import { insertAfter } from '../ts/element.insertAfter';
import { removeElement } from '../ts/element.remove';
import { elementsFromPoint } from '../ts/elementsFromPoint';

@Directive({
  selector: '[hm-sortable]'
})
export class HmDirective implements AfterViewInit {

  @Input('hm-sortable') sourceObj;
  @Input('hm-sortable-enable') enable;

  @Input('elms-selector') elmsSelector: string;
  @Input('move-selector') moveSelector: string;

  @Input('select-style') selectStyle: any;
  @Input('moving-style') movingStyle: any;

  @Output('sort-complete') sortComplete = new EventEmitter();

  private elms;
  private storeStyle = {};
  private selectNode;
  // store the first select index
  private selectIndex;
  private nowIndex;
  private sort_clone_obj;

  private disY;
  private priAction;

  private rand = Math.ceil(Math.random() * 100000000);

  constructor(
    private parentELm: ElementRef,
    private _noze: NgZone) { }

  ngAfterViewInit(): void {
    this.elms = this.setSelectorElm(this.parentELm.nativeElement);
    this.bindHammar(this.getMoveSelector(this.parentELm.nativeElement));
  }

  private setSelectorElm(elm) {
    elm.id = `dd${this.rand}`;
    return Array.from(elm
      .querySelectorAll(`#dd${this.rand}>${this.elmsSelector}`));
  }

  private getMoveSelector(elm) {
    return elm
      .querySelectorAll(`#dd${this.rand}>${this.elmsSelector}>${this.moveSelector}`);
  }

  private bindHammar(elms) {
    Array.from(elms).forEach((el: HTMLElement, index: number) => {
      const mc = new Hammer(el);
      // let the pan gesture support all directions.
      // this will block the vertical scrolling on a touch-device while on the element
      mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

      mc.on('panstart', (event: any) => {
        event.preventDefault();
        this.selectIndex = this.nowIndex = +event.target.parentNode.attributes.index.value;
        // set choiceNode to this start tag
        this.selectNode = this.elms[this.nowIndex];
        // get distance from this tag's origin
        this.disY = Math.abs(this.selectNode.getBoundingClientRect().top - event.center.y);
        // set this elem style
        Object.assign(this.selectNode.style, {
          pointerEvents: 'none'
        });

        // clone a new tag call sort_clone_obj and hidden it
        this.sort_clone_obj = this.createMovingTag();

        // store the choiceTag original css
        Object.keys(this.selectStyle).forEach((key) => {
          this.storeStyle[key] = this.selectNode.style[key];
        });
        // change changeStyle
        Object.assign(this.selectNode.style, this.selectStyle);
      });

      mc.on('panmove', (event) => {

        this._noze.runOutsideAngular(() => {
          event.preventDefault();

          Object.assign(this.sort_clone_obj.style, {
            pointerEvents: 'none',
            top: `${event.center.y - this.disY}px`,
            position: 'fixed',
            display: '',
            zIndex: '3'
          });

          elementsFromPoint(event.center.x, event.center.y, (item: Element) => {
            return item.tagName === 'LI' && item.parentNode === this.parentELm.nativeElement;
          }).then((getElm: any) => {

            const toIndex = +getElm.attributes.index.value;
            if (this.nowIndex !== toIndex) {
              if (this.nowIndex > toIndex) {
                this.insertBefore(getElm);
              } else {
                this.insertAfter(getElm);
              }
            } else {
              switch (this.priAction) {
                case MOVE_TYPE.UP:
                  this.insertAfter(getElm);
                  break;
                case MOVE_TYPE.DOWN:
                  this.insertBefore(getElm);
                  break;
              }
            }
            this.nowIndex = toIndex;
          });
        });
      });

      mc.on('panend', (event) => {
        this._noze.runOutsideAngular(() => {
          this.selectNode.style.pointerEvents = '';
          removeElement(this.sort_clone_obj);
          Object.assign(this.elms[this.selectIndex].style, this.storeStyle);

          this.elms = this.setSelectorElm(this.parentELm.nativeElement);
          const id = this.elms.indexOf(this.selectNode);

          if (this.selectIndex !== id) {
            const tmp = this.sourceObj[this.selectIndex];
            this.sourceObj.splice(this.selectIndex, 1);
            this.sourceObj.splice(id, 0, tmp);

            this.sortComplete.emit(this.sourceObj);
          }

          // when move complete clear all unuse variable
          this.storeStyle = {};
          this.selectNode = undefined;
          this.sort_clone_obj = undefined;
          this.selectIndex = undefined;
          this.nowIndex = undefined;
          this.disY = undefined;
          this.priAction = undefined;

        });
      });
    });
  }

  private insertBefore(getElm: any) {
    this.priAction = MOVE_TYPE.UP;
    this.parentELm.nativeElement.insertBefore(this.selectNode, getElm);
  }

  private insertAfter(getElm: any) {
    this.priAction = MOVE_TYPE.DOWN;
    insertAfter(this.selectNode, getElm);
  }

  // clone a new tag call sort_clone_obj and hidden it
  private createMovingTag() {
    const clnElm = this.selectNode.cloneNode(true);
    clnElm.id = 'sort_clone_obj';
    const style = {
      position: 'absolute',
      display: 'none'
    };
    Object.assign(clnElm.style, style, this.movingStyle);
    this.parentELm.nativeElement.appendChild(clnElm);
    return clnElm;
  }

}


enum MOVE_TYPE {
  UP = 'up',
  DOWN = 'down'
}
