import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginForgotPassPageRoutingModule } from './login-forgot-pass-routing.module';

import { LoginForgotPassPage } from './login-forgot-pass.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginForgotPassPageRoutingModule
  ],
  declarations: [LoginForgotPassPage]
})
export class LoginForgotPassPageModule {}
