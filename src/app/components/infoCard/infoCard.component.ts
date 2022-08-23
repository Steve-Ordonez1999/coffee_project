import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/services/shared.services';

@Component({
  selector: 'app-cart',
  templateUrl: './infoCard.component.html',
  styleUrls: ['./infoCard.component.scss'],
})
export class InfoCardComponent implements OnInit {

  public productCart: any[] = [];
  public product: any[] = [];
  public haveProducts: Boolean = false;
  constructor(
    private share: SharedService
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    
  }
    
}
