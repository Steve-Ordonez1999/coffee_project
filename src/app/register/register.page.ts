import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SharedService } from 'src/services/shared.services';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  constructor(
    private authService: UserService,
    private share: SharedService,
    private router: Router,
    private platform: Platform

  ) {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      this.router.navigate(['/login'])
    });
  }
  public isView: Boolean = false;
  public isView1: Boolean = false;
  public loginObj;

  ngOnInit() {
    this.loginObj = {
      email: '',
      password: '',
      confirmPass: ''
    }
  }

  showPass() {
    let txtPass: any = document.getElementById('pass');
    let txtPass1: any = document.getElementById('pass1');
    let txtPasscell: any = document.getElementById('passcell');
    let txtPass1cell: any = document.getElementById('pass1cell');

    if (txtPass.type == 'text' || txtPass1.type == 'text' || txtPasscell.type == 'text' || txtPass1cell.type == 'text') {
      txtPass.type = 'password'
      txtPass1.type = 'password'
      txtPasscell.type = 'password'
      txtPass1cell.type = 'password'
    }
    else {
      txtPass.type = 'text'
      txtPass1.type = 'text'
      txtPasscell.type = 'text'
      txtPass1cell.type = 'text'
    }

    this.isView = !this.isView;
  }

  showPass1() {
    let txtPass: any = document.getElementById('pass1');
    if (txtPass.type == 'text')
      txtPass.type = 'password'
    else
      txtPass.type = 'text'
    this.isView1 = !this.isView1;
  }

  async register() {
    if (this.loginObj.email != '' && this.loginObj.password != '' && this.loginObj.confirmPass != '')
      if (this.validarCorreo(this.loginObj.email)) {
        if (this.loginObj.password == this.loginObj.confirmPass) {
          const user: any = await this.authService.register(this.loginObj);
          this.share.showToastColor('', 'Usuario registrado exitosamente', 's', 's');
          sessionStorage.setItem('user', JSON.stringify(user));
          this.router.navigate(['/tabs/dashboard']).then(r => { });
        }
        else
          this.share.showToastColor('', 'No coinciden las contraseñas.', 'w', 's');
      }
      else
        this.share.showToastColor('', 'Formato de correo incorrecto.', 'w', 's');
    else
      this.share.showToastColor('', 'Hay campos vacíos.', 'w', 's');
  }

  validarCorreo(correo) {
    const arrayCorreo = correo.split("@")
    if (arrayCorreo.length > 1) {
      const dominio = arrayCorreo[1].split(".")
      if (dominio.length > 1) {
        if (dominio[0] && dominio[1])
          return true
      }
    }
    return false
  }

  validaPalabra(cadena) {
    for (let x = 0; x < cadena.length; x++) {
      let c = cadena[x]
      // Si no está entre a y z, ni entre A y Z, ni es un espacio
      if (!((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == ' ' || c == 'Á' || c == 'É' || c == 'Í' || c == 'Ó' || c == 'Ú' || c == 'á' || c == 'é' || c == 'í' || c == 'ó' || c == 'ú' || c == 'ñ' || c == 'Ñ')) {
        return false;
      }
    }
    return true;
  }
}
