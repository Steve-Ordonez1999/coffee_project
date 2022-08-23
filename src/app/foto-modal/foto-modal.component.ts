import { Component, Input, OnInit } from '@angular/core';
import { SharedService } from 'src/services/shared.services';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-foto-modal',
  templateUrl: './foto-modal.component.html',
  styleUrls: ['./foto-modal.component.scss'],
})
export class FotoModalComponent implements OnInit {

  @Input() data;

  constructor(
    private _sharedService: SharedService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }

  dismissModal() {
    this.modalController.dismiss()
  }
}
