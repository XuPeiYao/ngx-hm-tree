import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { selector } from 'rxjs/operator/publish';
import { UiTreeNode } from './ui-tree-node';

export const EXPANSION_PANEL_ANIMATION_TIMING =
  '225ms cubic-bezier(0.4,0.0,0.2,1)';

@Component({
  selector: 'app-ui-tree',
  templateUrl: './ui-tree.component.html',
  styleUrls: ['./ui-tree.component.css'],
  animations: [
    trigger('bodyExpansion', [
      state('collapsed', style({ height: '0px', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition(
        'expanded <=> collapsed',
        animate(EXPANSION_PANEL_ANIMATION_TIMING)
      )
    ])
  ]
})
export class UiTreeComponent {
  state = 'expanded';

  @Input('searchText') searchText = '';
  @Input('nodes') nodes: Array<UiTreeNode>;
  @Input('key') key = 'children';

  enable = true;
  selectStyle = {
    opacity: 0.5,
    color: 'blue'
  };
  movingStyle = {
    color: 'red'
  };

  constructor() {}

  complete(event) {
    // console.log(event);
  }

  /**
   * 縮起子節點
   */
  close() {
    this.state = 'collapsed';
  }

  /**
   * 展開子節點
   */
  open() {
    this.state = 'expanded';
  }
}
