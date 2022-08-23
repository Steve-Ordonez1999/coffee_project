import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { PRIORIDAD, SharedService } from 'src/services/shared.services';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-login-forgot-pass',
  templateUrl: './login-forgot-pass.page.html',
  styleUrls: ['./login-forgot-pass.page.scss'],
})
export class LoginForgotPassPage implements OnInit {

  email

  constructor(
    private authService: UserService,
    private share: SharedService,
    private router: Router,
    private platform: Platform
  ) {
    this.platform.backButton.subscribeWithPriority(PRIORIDAD, async () => {
      this.router.navigate(['/login'])
    });
  }

  ngOnInit() {
  }

  sendMail() {
    this.authService.resetPasword(this.email).then(response => {
      this.router.navigate(['/login'])
      this.share.showToastColor('', 'Se ha enviado un correo para recuperar la constraseña, revise su bandeja de entrada y espam', 's', 'L');
    }).catch(ex => {
      this.share.showToastColor('', this.share.getMessageError(ex.code), 'w', 'm');
    })
  }

}
