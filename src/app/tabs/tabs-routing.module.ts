import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/services/auth.guard';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardPageModule),
        //canActivate: [AuthGuard]
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule),
        //canActivate: [AuthGuard]
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule),
        ///canActivate: [AuthGuard]
      },
      {
        path: 'reporting',
        loadChildren: () => import('../reporting/reporting.module').then(m => m.ReportingPageModule),
        //canActivate: [AuthGuard]
      },
      {
        path: 'real-time',
        loadChildren: () => import('../real-time/real-time.module').then(m => m.RealTimePageModule)
      },
      {
        path: 'real-time/:type',
        loadChildren: () => import('../real-time/real-time.module').then(m => m.RealTimePageModule)
      },
      {
        path: '',
        redirectTo: '/tabs',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule { }
