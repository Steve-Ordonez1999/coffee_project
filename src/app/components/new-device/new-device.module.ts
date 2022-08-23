import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewDevicePageRoutingModule } from './new-device-routing.module';

import { NewDevicePage } from './new-device.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewDevicePageRoutingModule
  ],
  declarations: [NewDevicePage]
})
export class NewDevicePageModule {}
