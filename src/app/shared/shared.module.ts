import 'hammerjs';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import {
  UiTreeComponent
} from './components';

import {
  DragMoveDirective,
  HmDirective
} from './directives';

import {
  FilterPipe,
  HighlightPipe,
  TimingPipe
} from './pipes';

const SHARE_COMPONENTS = [
  UiTreeComponent
];

const SHARE_DIRECTIVES = [
  HmDirective
];

const SHARE_PIPES = [
  FilterPipe,
  HighlightPipe,
  TimingPipe
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    NgZorroAntdModule.forRoot()
  ],
  declarations: [
    SHARE_COMPONENTS,
    SHARE_DIRECTIVES,
    SHARE_PIPES
  ],
  exports: [
    SHARE_COMPONENTS
  ]
})
export class SharedModule { }
