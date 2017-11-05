import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';

import { elementsFromPoint } from '../ts/elementsFromPoint';
import { removeElement } from '../ts/element.remove';
import { insertAfter } from '../ts/element.insertAfter';

@Directive({
  selector: '[hm-sortable]'
})
export class HmDirective implements AfterViewInit {

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

  private rand = Math.ceil(Math.random() * 100000000);

  constructor(private parentELm: ElementRef) { }

  ngAfterViewInit(): void {
    this.setSelectorElm();
    this.bindHammar(this.getMoveSelector());
  }

  private getMoveSelector() {
    return this.parentELm.nativeElement
      .querySelectorAll(`#dd${this.rand}>${this.elmsSelector}>${this.moveSelector}`);
  }

  private setSelectorElm() {
    this.parentELm.nativeElement.id = `dd${this.rand}`;
    this.elms = Array.from(this.parentELm.nativeElement
      .querySelectorAll(`#dd${this.rand}>${this.elmsSelector}`));
  }

  private bindHammar(elms) {
    Array.from(elms).forEach((el: HTMLElement) => {
      const mc = new Hammer(el);
      // let the pan gesture support all directions.
      // this will block the vertical scrolling on a touch-device while on the element
      mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

      mc.on('panstart', (event: any) => {
        event.preventDefault();
        this.setSelectorElm();
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
          let nowI = getElm.nextSibling.attributes ? +getElm.nextSibling.attributes.index.value : this.elms.length;

          // 如果下一個是自己，代表是往上走，所以要插入在他之前，其他狀況就是擦在下面
          if (nowI === this.selectIndex) {
            nowI = +getElm.attributes.index.value;
            this.parentELm.nativeElement.insertBefore(this.selectNode, getElm);
          } else {
            insertAfter(this.selectNode, getElm);
          }
        });
      });

      mc.on('panend', (event) => {
        this.selectNode.style.pointerEvents = '';
        removeElement(this.sort_clone_obj);
        Object.assign(this.elms[this.selectIndex].style, this.storeStyle);
        // when move complete clear all unuse variable
        this.elms = undefined;
        this.storeStyle = {};
        this.selectNode = undefined;
        this.sort_clone_obj = undefined;
        // store the first select index
        this.selectIndex = undefined;
        this.nowIndex = undefined;
        this.disY = undefined;
      });
    });
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
    this.parentELm.nativeElement.append(clnElm);
    return clnElm;
  }

}
