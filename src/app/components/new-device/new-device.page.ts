import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { nodoServices } from 'src/services/nodoServices';
import { SharedService } from 'src/services/shared.services';

@Component({
  selector: 'app-new-device',
  templateUrl: './new-device.page.html',
  styleUrls: ['./new-device.page.scss'],
})
export class NewDevicePage implements OnInit {

  public infoDevice;

  constructor(
    private share: SharedService,
    private modal: ModalController,
    private nodos: nodoServices,
  ) { }

  ngOnInit() {
    this.initForm();
  }

  ionViewWillEnter() {
    this.initForm();
  }

  initForm() {
    let hoy = this.share.getDateNow();
    this.infoDevice = {
      lastDate: '',
      lasthour: '',
      createDate: hoy.fecha,
      createHour: hoy.hora,
      nombre: "",
      isActive: true
    }
  }

  close() {
    this.modal.dismiss();
  }

  async saveDevice() {
    const response = await this.nodos.addNewDevice(this.infoDevice).toPromise();
    if (response.name) {
      this.close();
    }

  }
}
