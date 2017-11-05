import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ui-tree',
  templateUrl: './ui-tree.component.html',
  styleUrls: ['./ui-tree.component.css']
})
export class UiTreeComponent {

  @Input('searchText') searchText = '';
  @Input('nodes') nodes: Array<any>;
  @Input('key') key = 'children';


  selectStyle = {
    opacity: 0.5,
    color: 'blue'
  };
  movingStyle = {
    color: 'red',
  };

  constructor() { }

  elmsSelector(e: Element) {
    return e.tagName === 'li'.toUpperCase();
  }

  moveSelector(e: Element) {
    return e.tagName === 'button'.toUpperCase();
  }
}
