import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { DataService, tableDataset } from 'src/services/data.service';
import { Months, nodoServices } from 'src/services/nodoServices';
import { colorParams, labelsParams, SharedService } from 'src/services/shared.services';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-real-time',
  templateUrl: './real-time.page.html',
  styleUrls: ['./real-time.page.scss'],
})
export class RealTimePage implements OnInit {

  @ViewChild('lineCanvasH') private lineCanvasH: ElementRef;
  @ViewChild('lineCanvasT') private lineCanvasT: ElementRef;
  @ViewChild('lineCanvasP') private lineCanvasP: ElementRef;

  lineChartH: any;
  lineChartT: any;
  lineChartP: any;

  data = [];

  maxHoras = 48;
  horas = 1;

  lastRows: any[] = [];
  datesRows: any[] = [];
  hRows: any[] = [];
  tRows: any[] = [];
  pRows: any[] = [];

  param;

  private type;
  active = false;

  constructor(
    private menu: MenuController,
    private router: Router,
    private route: ActivatedRoute,
    private share: SharedService,
    private nodos: nodoServices,
    private dataActions: DataService
  ) {
    this.param = this.route.snapshot.paramMap.get("type") ?? 'all';

    switch (this.param) {
      case 'humedad':
        this.type = 'HT'
        break;
      case 'temperatura':
        this.type = 'TA'
        break;
      case 'presion':
        this.type = 'PA'
        break;
      default:
        this.type = 'ALL'
        break;
    }
  }

  async ngOnInit() {
    await this.getData();
    this.linealChartMethot();
    this.active = true;
  }

  toggle() {
    this.menu.toggle();
  }

  async getData() {
    try {
      this.lastRows = [];
      this.horas = JSON.parse(sessionStorage.getItem('horas')) ?? 1;
      const response: any = await this.nodos.getInformacion().toPromise();

      Object.keys(response).forEach((k) => {
        let dateRowJson = this.share.jsonDate(response[k].fecha);
        let dateRow = new Date(dateRowJson.mes + '/' + dateRowJson.dia + '/' + dateRowJson.año + ' ' + response[k].hora);
        let lastHours = this.share.getLastHours(new Date(), this.horas);

        if (dateRow.getTime() > lastHours.getTime()) {
          let newEntry = {
            date: response[k].fecha + ' ' + response[k].hora,
            hum: response[k].parametros_tierra.HT,
            tem: response[k].parametros_ambiente.TA,
            pre: response[k].parametros_ambiente.PA,
          }
          this.lastRows.push(newEntry);
        }
      });
    } catch (ex) {
      if (ex.status) {
        this.share.showToastColor('Alerta', 'La sesión a caducado, refresca el token o vuelva a iniciar sesión', 'w', 'm')
        this.router.navigate(['../tabs/profile']).then(r => { });
      }

    }
  }

  prepareInfoRows() {
    this.datesRows = [];
    this.hRows = [];
    this.tRows = [];
    this.pRows = [];
    for (let row of this.lastRows) {
      this.datesRows.push(row.date);
      this.hRows.push(row.hum);
      this.tRows.push(row.tem);
      this.pRows.push(row.pre);
    }
  }

  async linealChartMethot() {
    await this.share.startLoading();
    this.prepareInfoRows();

    if (this.lineChartH) {
      this.lineChartH.clear();
      this.lineChartH.destroy();
    }

    this.lineChartH = new Chart(this.lineCanvasH.nativeElement, {
      type: 'line',
      data: {
        labels: this.datesRows,
        datasets: this.prepareDataSet(),
      },
      options: {
        /* scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        } */
      }
    });

    //let chart = document.getElementById('lineChart');
    //console.log(chart);
    //chart.style.position = 'relative';
    //chart.style.height = '54vh';
    //chart.style.width = '100%';

    this.lineChartH.update();
    this.share.stopLoading();
  }

  prepareDataSet() {
    let dataSet = [];

    this.data = [];
    switch (this.type) {
      case 'HT':
        this.data = this.hRows;
        break;
      case 'TA':
        this.data = this.tRows;
        break;
      case 'PA':
        this.data = this.pRows;
        break;
      default:
        this.type = 'ALL'
        break;
    }

    let newParam = {
      label: colorParams[this.type].label,
      fill: true,
      lineTension: 0.1,
      backgroundColor: colorParams[this.type].backgroundColor,
      borderColor: colorParams[this.type].selected,
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: colorParams[this.type].selected,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: colorParams[this.type].selected,
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 2,
      pointRadius: 4,
      pointHitRadius: 10,
      data: this.data,
      spanGaps: false,
    }

    dataSet.push(newParam);

    return dataSet;
  }

  async doRefresh(ev) {
    await this.getData();
    this.linealChartMethot();
    ev.target.complete();
  }

  ionViewWillLeave(){
    //pega el código que apaga la gestura está en el login.page.ts
    this.menu.swipeGesture(false);
    }

  async valNumber(number) {
    var numbers = /[0-9]/;
    if (!number.target.value) {
      this.share.showToastColor("¡Alerta!", "¡En el campo horas solo se aceptan números!", "w", "s");
      number.target.value = 1;
    }
    else {
      let copia = "";
      for (let x = 0; x < number.target.value.length; x++) {
        let y = "";

        y = number.target.value[x];
        console.log(y);

        if (y.match(numbers)) {
          copia += y;
        } else {
          this.share.showToastColor("¡Alerta!", "¡En el campo horas solo se aceptan números!", "w", "s");
        }
      }

      number.target.value = copia;

      if (number.target.value > this.maxHoras || number.target.value.length > 3) {
        number.target.value = number.target.value.substr(0, 3);
        this.share.showToastColor("¡Alerta!", "El máximo de horas es " + this.maxHoras, "w", "m");
        number.target.value = this.maxHoras;
      }
    }

    await sessionStorage.setItem('horas', JSON.stringify(number.target.value));
    console.log(this.router.url);

    //await this.router.navigate(['../' + this.router.url]).then(r => {
      window.location.replace(this.router.url);
    //});
    //this.ngOnInit();
  }
}
