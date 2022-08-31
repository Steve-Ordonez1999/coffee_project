import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PopoverController, ToastController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { AngularFireAuth } from '@angular/fire/compat/auth';

export const PRIORIDAD = 999999;

export const labelsParams = ['Humedad de la Tierra',/*  'PHT', 'HA',*/  'Temperatura del Ambiente',/* 'LA',*/ 'Presión del Ambiente'];

export const colorParams = {
  HT: {
    sig: 'HT',
    label: 'Humedad de la tierra',
    backgroundColor: 'rgba(255, 128, 0, 0.3)',
    selected: '#ff8000',
  },
  /*PH:{
    label:  'PH de la tierra' ,
    backgroundColor: 'rgba(64, 255, 141, 0.2)',
    selected: '#40ff8d',
  }*/
  /*HA: {
    sig: 'HA',
    label: 'Humedad del ambiente',
    backgroundColor: 'rgba(64, 180, 255, 0.2)',
    selected: '#40b4ff',
  },*/
  TA: {
    sig: 'TA',
    label: 'Temperatura del ambiente',
    backgroundColor: 'rgba(155, 255, 0, 0.2)',
    selected: '#9bff00',
  },
  /*LA: {
    sig: 'LA',
    label: 'Luz del ambiente',
    backgroundColor: 'rgba(255, 159, 64, 0.2)',
    selected: '#FFCE56',
  },*/
  PA: {
    sig: 'PA',
    label: 'Presión del ambiente',
    backgroundColor: 'rgba(20, 143, 112, 0.2)',
    selected: '#148F77',
  },
  OUT: {
    sig: 'OUT',
    label: 'Restante',
    backgroundColor: 'rgba(193, 193, 193, 0.5)',
    selected: '#c1c1c1',
  }
}

export const caracteresEspeciales = [
  '#',
  '@',
  '_',
  '-',
  '.',
  '!',
  '$',
  '%',
  '&',
  '/',
];

export const regxs = {
  lower: /^[a-z]+$/,
  upper: /^[A-Z]+$/,
  number: /^[0-9]+$/,
  upperLower: /^[A-Za-z0-9 ]+$/,
};

export var HTTP_OPTIONS_TOKEN_PDF = {
  headers: new HttpHeaders({
    Accept: 'application/pdf',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
    'Access-Control-Allow-Headers':
      'append,delete,entries,foreach,get,has,keys,set,values,Authorization',
  }),
  responseType: 'blob' as 'json',
};


export var HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
    'Access-Control-Allow-Headers':
      'append,delete,entries,foreach,get,has,keys,set,values,Authorization',
  }),
};

export const HTTP_OPTIONS_VND = {
  headers: new HttpHeaders({
    'Content-Type': 'application/vnd.api+json',
  }),
};

export var HTTP_OPTIONS_MULTIPART = {
  headers: new HttpHeaders({
    'Content-Type': 'multipart/form-data',
  }),
};

export var HTTP_OPTIONS_FORM = {
  headers: new HttpHeaders({
    "Content-Type": "application/x-www-form-urlencoded"
  })
};

export var currentModal = null;
export var currentModal2 = null;

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  questionAlert: any[] = [];
  loading;
  popover;

  constructor(
    public toastController: ToastController,
    public loadingController: LoadingController,
    public alertController: AlertController,
    private router: Router,
    public modalController: ModalController,
    //private iab: InAppBrowser,
    public popoverController: PopoverController,
    private _sanitizer: DomSanitizer,
    private afAuth: AngularFireAuth,
  ) { }

  contieneEspecial(password): boolean {
    for (let char of password) {
      for (let especial of caracteresEspeciales) {
        if (char == especial) {
          return true;
        }
      }
    }
    return false;
  }

  contieneMayus(password): boolean {
    for (let char of password) {
      char = String(char).trim();
      if (regxs.upper.test(char)) {
        return true;
      }
    }
    return false;
  }

  async startLoading() {
    this.loading = await this.loadingController.create({
      message: '',
      translucent: true,
      spinner: 'lines',
    });
    this.loading.present();
  }

  async stopLoading() {
    this.loading.dismiss();
  }

  closeModal() {
    if (currentModal2) {
      currentModal2.dismiss().then(() => {
        currentModal2 = null;
      });
    } else {
      currentModal.dismiss().then(() => {
        currentModal = null;
      });
    }
  }
  
  async confirmQuestion(header: any, message: string) {
    let resolveFunction: (confirm: boolean) => void;
    const promise = new Promise<boolean>(resolve => {
      resolveFunction = resolve;
    });
    const alert = await this.alertController.create({
      mode: 'ios',
      header: header,
      message: message,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => resolveFunction(false)
        },
        {
          text: 'Confirmar',
          handler: () => resolveFunction(true)
        },
      ],
    });
    await alert.present();
    await alert.onDidDismiss();
    return promise;
  }

  async confirm(
    header: any,
    message: string,
    actionDescription: string,
    ruta: string
  ) {
    let alert = this.alertController.create({
      cssClass: 'alertSms',
      header: header,
      message: message,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
          },
        },
        {
          text: actionDescription,
          handler: () => {
            this.logoutAuth();
            this.router.navigate([ruta]).then((r) => { });
          },
        },
      ],
    });
    this.questionAlert.push(alert);
    (await alert).present();
  }

  async logout(): Promise<boolean> {
    var resp: boolean = false;
    await this.confirm(
      'CONFIRMAR!',
      '¿Está seguro de cerrar sesión?',
      'Si, Cerrar Sesión',
      '/login'
    );
    return resp;
  }

  async logoutAuth(): Promise<void> {
    await this.afAuth.signOut();
    sessionStorage.clear();
  }

  async showToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 4000,
      position: 'top',
    });
    toast.present();
  }

  async showToastColor(head: string, msg: string, state: string, duration: string) {
    // 'success', 'warning', 'danger'
    let icon: any;
    let color: any;
    let time: number;

    switch (state) {
      //success
      case 's':
        icon = 'checkmark-circle-outline';
        color = 'success';
        break;
      //warning
      case 'w':
        icon = 'alert-circle-outline';
        color = 'warning';
        break;
      //danger
      case 'd':
        icon = 'close-circle-outline';
        color = 'danger';
        break;
    }

    switch (duration) {
      //short
      case 's':
        time = 1000;
        break;
      //medio
      case 'm':
        time = 5000;
        break;
      //long
      case 'l':
        time = 11000;
        break;
    }

    const toast = await this.toastController.create({
      header: head,
      message: msg,
      duration: time,
      position: 'middle',
      color: color,
      animated: true,
      buttons: [
        {
          side: 'start',
          icon: icon,
        },
        {
          icon: 'close-outline',
          role: 'cancel',
        },
      ],
    });
    toast.present();
  }

  calcularEdad(fecha) {
    var hoy = new Date();
    var cumpleanos = new Date(fecha);
    var edad = hoy.getFullYear() - cumpleanos.getFullYear();
    var m = hoy.getMonth() - cumpleanos.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
      edad--;
    }

    return edad;
  }

  getNombre(nombreCompleto) {
    return nombreCompleto.split(' ');
  }

  toShortTitle(dato) {
    return dato.substr(0, 25) + '...';
  }

  primeraLetraMayuscula(cadena) {
    const primerCaracter = cadena.charAt(0).toUpperCase();
    const restoDeLaCadena = cadena.substring(1, cadena.length);
    return primerCaracter.concat(restoDeLaCadena);
  }

  async presentPopover(page: any) {
    this.popover = await this.popoverController.create({
      component: page,
      translucent: true,
      mode: 'md',
    });
    await this.popover.present();

    const { role } = await this.popover.onDidDismiss();
  }

  async dimissPopover() {
    this.popover.dismiss();
  }

  async openModalPage(page: any) {
    const modal = await this.modalController.create({
      component: page,
      cssClass: 'my-custom-class',
    });
    if (currentModal) currentModal2 = modal;
    else currentModal = modal;
    await modal.present();
    const result = await modal.onDidDismiss();
    return result;
  }

  async openModalPageData(page: any, data: any) {
    const modal = await this.modalController.create({
      component: page,
      cssClass: 'my-custom-class',
      componentProps: {
        data: data,
      },
    });
    if (currentModal) currentModal2 = modal;
    else currentModal = modal;

    await modal.present();
    const result = await modal.onDidDismiss();
    return result;
  }

  public htmlProperty(html) {
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }

  encodeInfo(info: any) {
    let str = btoa(JSON.stringify(info));
    return str;
  }

  decodeInfo(info: any) {
    let str = JSON.parse(atob(info));
    return str;
  }

  saveNewInfoUser(user: any) {
    sessionStorage.setItem('user', JSON.stringify(user));
    if (localStorage.getItem('user') != null)
      localStorage.setItem('user', this.encodeInfo(user));
  }

  async confirmPassReauth() {
    let pass: any;
    let alert = this.alertController.create({
      header: 'Por favor ingrese su contraseña para reautenticar la sesión.',
      inputs: [
        {
          name: 'password',
          placeholder: 'Contraseña Nueva',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: data => { }
        },
        {
          text: 'Ok',
          handler: async data => {
            if (data.password == '')
              this.showToastColor('', "Faltan datos por ingresar", 'w', 's')
            else {
              pass = data.password;
            }
          }
        }
      ]
    });
    (await alert).present()
    return await this.alertController.dismiss(pass);

  }

  getMessageError(ex) {
    switch (ex) {
      case 'auth/wrong-password':
        return 'La contraseña no es válida o el usuario no tiene contraseña.'
      case 'auth/user-not-found':
        return 'No hay registro de usuario correspondiente a este identificador. Es posible que el usuario haya sido eliminado.'
      case 'auth/invalid-email':
        return 'La dirección de correo electrónico está mal formateada.'
    }
  }

  getTempColor(temperatura) {
    if (temperatura < 20)
      return ['rgba(0, 22, 255, 0.4)', '#0016ff', 'rgba(0, 22, 255, 1)'];
    if (temperatura > 20 && temperatura <= 25)
      return ['rgba(155, 255, 0, 0.2)', '#9bff00', 'rgba(155, 255, 0, 1)'];
    if (temperatura > 25 && temperatura <= 30)
      return ['rgba(236, 255, 0, 0.2)', '#ecff00', 'rgba(236, 255, 0, 1)'];
    if (temperatura > 30)
      return ['rgba(255, 0, 0, 0.2)', '#ff0000', 'rgba(255, 0, 0, 1)'];
  }

  trunc(x, posiciones = 0) {
    var s = x.toString()
    var l = s.length
    var decimalLength = s.indexOf('.') + 1

    if (l - decimalLength <= posiciones) {
      return x
    }
    // Parte decimal del número
    var isNeg = x < 0
    var decimal = x % 1
    var entera = isNeg ? Math.ceil(x) : Math.floor(x)
    // Parte decimal como número entero
    // Ejemplo: parte decimal = 0.77
    // decimalFormated = 0.77 * (10^posiciones)
    // si posiciones es 2 ==> 0.77 * 100
    // si posiciones es 3 ==> 0.77 * 1000
    var decimalFormated = Math.floor(
      Math.abs(decimal) * Math.pow(10, posiciones)
    )
    // Sustraemos del número original la parte decimal
    // y le sumamos la parte decimal que hemos formateado
    var finalNum = entera +
      ((decimalFormated / Math.pow(10, posiciones)) * (isNeg ? -1 : 1))

    return finalNum
  }

  getDateNow() {
    let fecha = new Date();
    let all = {
      fecha: fecha.getDate() + '/' + (fecha.getMonth() + 1) + '/' + fecha.getFullYear(),
      hora: fecha.getHours() + ':' + fecha.getMinutes()
    }

    return all;
  }

  jsonDate(fecha) {
    let d: any = this.toShortDate(fecha);
    d = d.split('-');
    if (d.length == 1) {
      d = d[0].split('/');
      let date = {
        dia: parseInt((d[0])),
        mes: parseInt(d[1]),
        año: parseInt(d[2])
      }
      return date;
    }
    let date = {
      dia: parseInt((d[1])),
      mes: parseInt(d[0]),
      año: parseInt(d[2])
    }

    return date;
  }

  toShortDate(dato) {

    let fecha = dato.substr(0, 10);
    fecha = fecha.split('-');
    if (fecha.length == 1) {
      fecha = dato.substr(0, 10);
      fecha = fecha.split('/');

      return fecha[1] + '-' + fecha[0] + '-' + fecha[2];
    }

    if (fecha[2].length > 2)
      return fecha[1] + '/' + fecha[0] + '/' + fecha[2];
    else
      return fecha[2] + '/' + fecha[1] + '/' + fecha[0];
  }

  getColorsParams(param, temp) {
    let color_temp = this.getTempColor(temp);

    let labels = [];
    let bases = [];
    let selecteds = [];

    if (param != '') {
      labels.push(colorParams[param].label);
      if (param == 'TA') {
        bases.push(color_temp[0]);
        selecteds.push(color_temp[1]);
      } else {
        bases.push(colorParams[param].backgroundColor);
        selecteds.push(colorParams[param].selected);
      }
      labels.push(colorParams['OUT'].label);
      bases.push(colorParams['OUT'].backgroundColor);
      selecteds.push(colorParams['OUT'].selected);
    } else {
      Object.keys(colorParams).forEach((param) => {
        if (param != 'OUT') {
          labels.push(colorParams[param].label);
          if (param == 'TA') {
            bases.push(color_temp[0]);
            selecteds.push(color_temp[1]);
          } else {
            bases.push(colorParams[param].backgroundColor);
            selecteds.push(colorParams[param].selected);
          }
        }
      });
    }
    let colors = {
      labels: labels,
      base: bases,
      selected: selecteds
    }
    /* if (param == "") {

       colors.labels.filter((item) => item !== '')
       colors.base.filter((item) => item !== 'rgba(193, 193, 193, 0.5)')
       colors.selected.filter((item) => item !== '#c1c1c1')
     }
     if (param != "" && !colors.labels.includes('')) {

       colors.labels.push('')
       colors.base.push('rgba(193, 193, 193, 0.5)');
       colors.selected.push('#c1c1c1');
     }*/

    return colors;
  }

  setTimeExpire() {
    var now = new Date();
    var addMlSeconds = 60 * 60000;
    var expire = new Date(now.getTime() + addMlSeconds);

    return expire.getTime();
  }
}
