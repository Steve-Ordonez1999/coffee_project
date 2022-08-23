import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { PRIORIDAD, SharedService } from 'src/services/shared.services';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private authService: UserService,
    private share: SharedService,
    private route: Router,
    private platform: Platform
  ) {
    this.platform.backButton.subscribeWithPriority(PRIORIDAD, () => {
      navigator['app'].exitApp();
    });
  }
  public isView: Boolean = false;
  public loginObj;

  ngOnInit() {
    this.loginObj = {
      email: '',
      password: ''
    }
  }

  showPass() {
    let txtPass: any = document.getElementById('pass');
    let txtPass1: any = document.getElementById('pass1');
    if (txtPass.type == 'text')
      txtPass.type = 'password'
    else
      txtPass.type = 'text'

    if (txtPass1.type == 'text')
      txtPass1.type = 'password'
    else
      txtPass1.type = 'text'

    this.isView = !this.isView;
  }

  async login() {
    try {
      await this.share.startLoading();
      if (this.loginObj.email != '' && this.loginObj.password != '') {
        const user: any = await this.authService.login(this.loginObj);
        if (user) {
          await this.route.navigate(['/tabs/dashboard']).then(r => { });
          sessionStorage.setItem('user', JSON.stringify(user));
          this.share.showToastColor('', 'Bienvenido de nuevo ' + user.email, 's', 'm');
        }
        this.share.stopLoading();
      }
      else
        this.share.showToastColor('', 'Hay campos vacíos.', 'w', 's');
    }
    catch (ex) {
      this.share.stopLoading();
      let msg = this.share.getMessageError(ex.code);
      this.share.showToastColor('', msg, 'd', 'm')
    }
  }

}
