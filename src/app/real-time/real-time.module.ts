import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RealTimePageRoutingModule } from './real-time-routing.module';

import { RealTimePage } from './real-time.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RealTimePageRoutingModule
  ],
  declarations: [RealTimePage]
})
export class RealTimePageModule { }
