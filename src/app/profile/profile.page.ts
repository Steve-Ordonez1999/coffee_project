import { Component, OnInit } from '@angular/core';

import { ActionSheetController, Platform } from '@ionic/angular';
import { PRIORIDAD, SharedService } from 'src/services/shared.services';
import { UserService } from 'src/services/user.service';
import { FotoModalComponent } from '../foto-modal/foto-modal.component';

import { Camera, CameraResultType, CameraSource, GalleryImageOptions, ImageOptions, } from "@capacitor/camera";
import { Router } from '@angular/router';

import { Filesystem } from "@capacitor/filesystem";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  minutes;
  fechaNacimiento;
  infoUser;
  base64Img;

  isEdit: Boolean = false;
  isDesck: Boolean = false;

  showCalendar: boolean = false;

  constructor(
    private share: SharedService,
    private user: UserService,
    public actionSheetController: ActionSheetController,
    private platform: Platform,
    private authServ: UserService,
    private router: Router,
  ) {
    this.platform.backButton.subscribeWithPriority(PRIORIDAD, async () => {
      if (this.router.url == '/tabs/profile')
        this.router.navigate(['/tabs/dashboard']).then(r => { });
    });

    for (let plat of platform.platforms()) {
      if (plat == "desktop" || plat == "mobileweb")
        this.isDesck = true;
    }
  }

  cameraOptions: ImageOptions = {
    quality: 50,
    width: 640,
    height: 640,
    correctOrientation: true,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Camera
  }

  galleryOptions: GalleryImageOptions = {
    quality: 50,
    width: 640,
    height: 640,
    correctOrientation: true,
    limit: 1
  };

  ionViewWillEnter() {
    this.infoUser = JSON.parse(sessionStorage.getItem('infoUser'));
    if (!this.infoUser.telf)
      this.infoUser.telf = "";
    if (!this.infoUser.fechaNacimiento)
      this.infoUser.fechaNacimiento = "Vacío";

    this.fechaNacimiento = this.share.toShortDate(this.infoUser.fechaNacimiento);

    this.calculateTimeSession();
  }

  ngOnInit() {
    this.infoUser = {
      uid: "",
      displayName: "",
      email: "",
      emailVerified: "",
      photoURL: "",
      telf: "",
      fechaNacimiento: "Vacío",
    }
  }

  async menuCamara() {
    const actionSheet = await this.actionSheetController.create({

      header: 'Actualizar foto desde: ',
      cssClass: 'optionMenu',
      mode: 'md',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera-outline',
          handler: () => {
            this.openCamera()
          }
        }, {
          text: 'Galería',
          icon: 'images-outline',
          handler: async () => {
            this.openGallery()
          }
        }, {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
          handler: () => {
          }
        }]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
  }

  async openCamera() {
    Camera.getPhoto(this.cameraOptions).then(
      async (imgData) => {
        this.base64Img = imgData.dataUrl;;
        this.infoUser.photoURL = this.base64Img;
        this.updateInfoUser();
      }, (err) => {
        console.log(err);
      });
  }

  async openGallery() {
    Camera.pickImages(this.galleryOptions).then(
      async (imgData) => {
        const contents = await Filesystem.readFile({
          path: imgData.photos[0].path,
        });
        this.base64Img = "data:image/jpeg;base64," + contents.data;
        if (!this.base64Img) {
          this.share.showToast("Imagen no válida");
          return;
        }
        this.infoUser.photoURL = this.base64Img;
        this.updateInfoUser();

      }, (err) => {
        this.share.showToastColor('Surgió un error!!', 'Error: ' + err, 'd', 's')
      });
  }

  updateInfoUser() {
    this.user.updateUserData(this.infoUser).then(response => {
      this.share.showToastColor('', 'Datos guardados correctamente.', 's', 's');
    }).catch(ex => {
      console.log(ex);
    });
  }

  async openModalPhoto() {
    this.share.openModalPageData(FotoModalComponent, this.infoUser.photoURL);
  }

  edit() {
    this.isEdit = !this.isEdit;
  }

  update() {
    this.isEdit = false;
    this.updateInfoUser();

  }

  logout() {
    this.share.logout();
  }

  hiddenPick() {
    this.showCalendar = false;
  }

  showDatePick() {
    if (this.isEdit)
      this.showCalendar = true;
    else
      this.showCalendar = false;
  }

  selectDate(fecha) {
    this.showCalendar = false;
    this.infoUser.fechaNacimiento = this.share.toShortDate(fecha);
  }

  async renoveSession() {
    try {
      const response = await this.authServ.onIdTokenRevocation().toPromise();
     
      let newStsTokenManager = {
        refreshToken: response.refresh_token,
        accessToken: response.access_token,
        expirationTime: this.share.setTimeExpire()
      }

      let user = JSON.parse(sessionStorage.getItem('user'));
      user.stsTokenManager = newStsTokenManager;

      sessionStorage.setItem('user', JSON.stringify(user));

      this.share.showToastColor('Correcto!!', 'su sesión se validó por 60 minutos más.', 's', 'm')

      this.calculateTimeSession();

    } catch (ex) {
      this.share.showToastColor('Error!!', 'No pudo renovarse la sesión, vuelva a iniciar', 'd', 'm')
      this.router.navigate(['/login']).then(r => { });
      console.log(ex);
    }

  }

  calculateTimeSession() {
    let time = JSON.parse(sessionStorage.getItem('user')).stsTokenManager.expirationTime;

    let expire = new Date(time);
    let now = new Date();

    var dif = (expire.getTime() - now.getTime());
    this.minutes = Math.round((dif / 1000) / 60);
   
  }

  valtel(tel) {

    var numbers = /[0-9]/;
    let initel = tel.target.value[0];
    let fintel = tel.target.value;

    let copia = "";
    for (let x = 0; x < fintel.length; x++) {
      let y = "";

      y = fintel[x];
      if (y.match(numbers) || (y == "+" && x == 0)) {

        copia += y;
      } else {
        this.share.showToastColor("¡Alerta!", "¡En el campo teléfono solo se aceptan números! y el formato +593 XXX XXX XXXX ó 0XX XXX XXXX", "w", "m");
      }
    }

    this.infoUser.telf = copia;
    tel.target.value = copia;

    var error = false;
    if (tel.target.value[0] == '0') {
      if (tel.target.value.length > 10) {
        tel.target.value = tel.target.value.substr(0, 10);
        this.infoUser.telf = tel.target.value.substr(0, 10);
        error = true;
      }
    } else if (tel.target.value[0] == '+')
      if (tel.target.value.length > 13) {
        tel.target.value = tel.target.value.substr(0, 13);
        this.infoUser.telf = tel.target.value.substr(0, 13);
        error = true;

      }
    if (error)
      this.share.showToastColor("¡Alerta!", "¡En el campo teléfono solo se aceptan 13 caracteres en el formato +593 XXX XXX XXXX y 10 en el formato 0XX XXX XXXX!", "w", "m");

    return false;

  }

}

