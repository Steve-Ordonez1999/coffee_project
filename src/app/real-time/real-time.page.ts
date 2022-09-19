import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuController, Platform } from '@ionic/angular';
import { DataService, tableDataset } from 'src/services/data.service';
import { Months, nodoServices } from 'src/services/nodoServices';
import { colorParams, labelsParams, SharedService } from 'src/services/shared.services';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart } from 'chart.js';
import { Observable, timer } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-real-time',
  templateUrl: './real-time.page.html',
  styleUrls: ['./real-time.page.scss'],
})
export class RealTimePage implements OnInit {

  @ViewChild('lineCanvas') private lineCanvas: ElementRef;
  title = 'Datos en tiempo real';

  lineChart: any;

  data = [];

  maxHoras = 48;
  horas = "1";
  optionsHours = [];

  rowsFilter: any[] = [];
  lastRows: any[] = [];

  datesRows: any[] = [];
  hRows: any[] = [];
  tRows: any[] = [];
  pRows: any[] = [];

  param;

  isDesck = false;

  updateExecute = 0;

  type;
  active = false;
  executin = 0;

  realTimeExecution;
  timeExecution = "30";


  hoy = this.share.toFormatPoopDate((new Date()).toLocaleDateString());
  dateFilter = (new Date()).toLocaleDateString();

  constructor(
    private menu: MenuController,
    private router: Router,
    private route: ActivatedRoute,
    private share: SharedService,
    private platform: Platform,
    private nodos: nodoServices,
    private dataActions: DataService
  ) {
    this.param = this.route.snapshot.paramMap.get("type") ?? 'registros';

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
      case 'registros':
        this.type = 'RE'
        break;
      default:
        //this.type = 'ALL'
        break;
    }

    for (let plat of platform.platforms()) {
      if (plat == "desktop")
        this.isDesck = true;
      if (plat == 'mobile')
        this.maxHoras = 12;
    }
  }

  async ngOnInit() {
    this.getMaxHoursOptions();
    this.menu.swipeGesture(false);
    await this.share.startLoading();
    await this.getData();
    this.share.stopLoading();

    if (this.type != 'RE')
      this.linealChartMethot();

    this.active = true;
    if (this.type != 'RE')
      this.executeAsyncTask();

  }

  getMaxHoursOptions() {
    for (let cont = 0; cont < this.maxHoras; cont++) {
      this.optionsHours.push((cont + 1));
    }
  }

  toggle() {
    this.menu.toggle();
  }

  async getData() {
    try {
      this.lastRows = [];
      let response: any;

      

      if (this.type != 'RE') {
        response = await this.nodos.getInformacion(300).toPromise();
        Object.keys(response).forEach((k) => {
          let dateRowJson = this.share.jsonDate(response[k].fecha);
          let dateRow = new Date(dateRowJson.mes + '/' + dateRowJson.dia + '/' + dateRowJson.año + ' ' + response[k].hora);
          let lastHours = this.share.getLastHours(new Date(), this.horas);

          if (dateRow.getTime() > lastHours.getTime()) {
            let newEntry = {
              date: response[k].fecha + ' ' + response[k].hora,
              hora: response[k].hora,
              hum: response[k].parametros_tierra.HT,
              tem: response[k].parametros_ambiente.TA,
              pre: response[k].parametros_ambiente.PA,
            }
            this.lastRows.push(newEntry);
          }
        });

      }
      else if (this.type == 'RE') {
        let now = this.share.jsonDate(this.share.getDateNow().fecha);
        let jsonDate = this.share.jsonDate(this.dateFilter);

        if (now.año == jsonDate.año && now.mes == jsonDate.mes && now.dia == jsonDate.dia)
          response = await this.nodos.getInformacion(100).toPromise();
        else
          response = JSON.parse(sessionStorage.getItem('metricas'));

        Object.keys(response).forEach((k) => {
          let kDate = this.share.jsonDate(response[k].fecha);

          if (kDate.mes == jsonDate.mes &&
            kDate.año == jsonDate.año &&
            kDate.dia == jsonDate.dia
          ) {
            let newEntry = {
              date: response[k].fecha + ' ' + response[k].hora,
              hora: response[k].hora,
              hum: this.share.trunc(response[k].parametros_tierra.HT, 0) + '%',
              tem: this.share.trunc(response[k].parametros_ambiente.TA, 0) + '°C',
              pre: response[k].parametros_ambiente.PA + ' PSI',
            }
            this.lastRows.push(newEntry);
          }
        });

      }
    } catch (ex) {
      if (ex.status) {
        this.share.showToastColor('Alerta', 'La sesión a caducado, refresca el token o vuelva a iniciar sesión', 'w', 'm')
        this.router.navigate(['../tabs/profile']).then(r => { });
      }
    }
  }

  prepareInfoRows() {
    //this.rowsFilter = [];
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
    this.prepareInfoRows();

    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
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

    this.lineChart.update();
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

  async updateDataChart() {
    this.updateExecute++;
    if (this.updateExecute < 2) {
      await this.getData();
      if (this.type != 'RE') {
        this.prepareInfoRows();
        this.lineChart.data = {
          labels: this.datesRows,
          datasets: this.prepareDataSet(),
        }
        this.lineChart.update();
        this.share.stopLoading();
      }
    } else
      this.updateExecute = 0;
  }

  async doRefresh(ev) {
    if (this.type != 'RE')
      this.updateDataChart();
    else {
      await this.share.startLoading();
      await this.getData();
      this.share.stopLoading();
    }
    if (ev.type == 'ionRefresh')
      ev.target.complete();
  }

  ionViewWillLeave() {
    clearInterval(this.realTimeExecution);
  }

  executeAsyncTask() {
    clearInterval(this.realTimeExecution);
    this.realTimeExecution = setInterval(() => { this.executeRealTime() }, Number(this.timeExecution) * 1000);
  }

  executeRealTime() {
    console.log("Ha pasado " + (this.timeExecution) + " segundos.", new Date());
    this.updateDataChart();
  }

  changeTimeExecution(ev) {
    this.timeExecution = ev.detail.value;
    this.executeAsyncTask();
  }

  async dateStart(value) {
    this.dateFilter = new Date(value).toLocaleDateString()
    await this.share.startLoading();
    await this.getData();
    this.share.stopLoading();
  }
}
