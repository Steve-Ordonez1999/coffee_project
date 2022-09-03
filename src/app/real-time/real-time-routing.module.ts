import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RealTimePage } from './real-time.page';

const routes: Routes = [
  {
    path: '',
    component: RealTimePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RealTimePageRoutingModule {}
