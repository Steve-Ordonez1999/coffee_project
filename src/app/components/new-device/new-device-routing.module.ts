import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewDevicePage } from './new-device.page';

const routes: Routes = [
  {
    path: '',
    component: NewDevicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewDevicePageRoutingModule {}
