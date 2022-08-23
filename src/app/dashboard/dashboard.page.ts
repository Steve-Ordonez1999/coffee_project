import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Chart } from 'chart.js';
import { nodoServices } from 'src/services/nodoServices';
import { labelsParams, PRIORIDAD, SharedService } from 'src/services/shared.services';
import { SwiperOptions } from 'swiper';
import { InfoCardComponent } from '../components/infoCard/infoCard.component';

import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, Zoom } from 'swiper';
SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom]);


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 50,
    navigation: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false
    },
    //loop: true,
    pagination: { clickable: true },
  };

  cont = 0;
  fechaCompleta
  hoy = {
    mes: 0,
    año: 0,
    dia: 0
  }
  filtro = []
  tot_hum_tierra = 0;
  tot_ph = 0;
  tot_hum_ambi = 0;
  tot_temp_ambi = 0;
  tot_luz_ambi = 0;
  tot_presion = 0;

  viewMode: Boolean = false;
  // Importando ViewChild. Necesitamos el decorador @ViewChild para obtener una referencia a la variable local
  // que hemos agregado al elemento canvas en la plantilla HTML.
  @ViewChild('barCanvas') private barCanvas: ElementRef;
  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;
  @ViewChild('polarAreaCanvas') private polarAreaCanvas: ElementRef;

  @ViewChild('doughnut1') private doughnut1: ElementRef;
  @ViewChild('doughnut2') private doughnut2: ElementRef;
  //@ViewChild('doughnut3') private doughnut3: ElementRef;
  @ViewChild('doughnut4') private doughnut4: ElementRef;
  //@ViewChild('doughnut5') private doughnut5: ElementRef;
  @ViewChild('doughnut6') private doughnut6: ElementRef;

  barChart: any;
  doughnutChart: any;
  lineChart: any;
  polarArea: any;

  constructor(
    private nodos: nodoServices,
    private share: SharedService,
    private platform: Platform,
    private router: Router
  ) {
    this.platform.backButton.subscribeWithPriority(PRIORIDAD, async () => {
      if (this.router.url == '/tabs/dashboard')
        this.share.logout();
    });

  }
  ngOnInit() {
  }


  // Cuando intentamos llamar a nuestro gráfico para inicializar métodos en ngOnInit(),
  // muestra un error nativeElement de undefined. Por lo tanto, debemos llamar a todos
  //los métodos de gráfico en ngAfterViewInit() donde se resolverán @ViewChild y @ViewChildren.
  async ionViewWillEnter() {
    this.getDate();
    await this.getData();
    this.barChartMethod();
    this.doughnutChartMethod();
    this.polarAreaMethod();
  }

  changeChart() {
    this.viewMode = !this.viewMode;
  }

  barChartMethod() {
    // Ahora necesitamos proporcionar una referencia de elemento de gráfico con un objeto que
    //defina el tipo de gráfico que queremos usar y el tipo de datos que queremos mostrar.
    let newData: number[] = [this.tot_hum_tierra ?? 0, /* this.tot_ph, this.tot_hum_ambi ?? 0, */ this.tot_temp_ambi ?? 0,/* this.tot_luz_ambi ?? 0,*/ this.tot_presion ?? 0]

    let color_temp = this.share.getTempColor(this.tot_temp_ambi);

    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labelsParams,
        datasets: [{
          label: '# of Votes',
          data: newData,
          backgroundColor: [
            'rgba(255, 128, 0, 0.3)',
            /* 'rgba(64, 255, 141, 0.2)', */
            /* 'rgba(64, 180, 255, 0.2)', */
            color_temp[0],
            /* 'rgba(255, 159, 64, 0.2)', */
            'rgba(20, 143, 119, 0.2)'
          ],
          borderColor: [
            'rgba(255, 128, 0, 1)',
            /*  'rgba(64, 255, 141, 1)', */
            /* 'rgba(64, 180, 255, 1)', */
            color_temp[2],
            /* 'rgba(255, 159, 64, 1)', */
            'rgba(20, 143, 119, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  doughnutChartMethod() {
    let allData: number[] = [this.tot_hum_tierra ?? 0, /* this.tot_ph, */ this.tot_hum_ambi ?? 0, this.tot_temp_ambi ?? 0, this.tot_luz_ambi ?? 0, this.tot_presion ?? 0]
    let cien = 100 - this.tot_hum_tierra
    let data_hum_tierra: number[] = [this.tot_hum_tierra ?? 0, cien]
    /*     cien = 100 - this.tot_ph
        let data_ph: number[] = [this.tot_ph, cien] */
    cien = 100 - this.tot_hum_ambi ?? 0
    let data_hum_ambi: number[] = [this.tot_hum_ambi ?? 0, cien]
    cien = 100 - this.tot_temp_ambi ?? 0
    let data_temp_ambi: number[] = [this.tot_temp_ambi ?? 0, cien]
    cien = 100 - this.tot_luz_ambi ?? 0
    let data_luz_ambi: number[] = [this.tot_luz_ambi ?? 0, cien]
    cien = 100 - this.tot_presion ?? 0
    let data_presion: number[] = [this.tot_presion ?? 0, cien]

    let color_temp = this.share.getTempColor(this.tot_temp_ambi ?? 0);

    this.doughnutChart = new Chart(this.doughnut1.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Humedad de la tierra'],
        datasets: [{
          label: '# of Votes',
          data: data_hum_tierra ?? 0,
          backgroundColor: [
            'rgba(255, 128, 0, 0.3)',
            'rgba(193, 193, 193, 0.5)',
          ],
          hoverBackgroundColor: [
            '#ff8000',
            '#c1c1c1',
          ]
        }]
      }
    });

    /*this.doughnutChart = new Chart(this.doughnut3.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Humedad del ambiente'],
        datasets: [{
          label: '# of Votes',
          data: data_hum_ambi ?? 0,
          backgroundColor: [
            'rgba(64, 180, 255, 0.2)',
            'rgba(193, 193, 193, 0.5)',
          ],
          hoverBackgroundColor: [
            '#40b4ff',
            '#c1c1c1',
          ]
        }]
      }
    });*/
    this.doughnutChart = new Chart(this.doughnut4.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Temperatura del ambiente'],
        datasets: [{
          label: '# of Votes',
          data: data_temp_ambi ?? 0,
          backgroundColor: [
            color_temp[0],
            'rgba(193, 193, 193, 0.5)',
          ],
          hoverBackgroundColor: [
            color_temp[1],
            '#c1c1c1',
          ]
        }]
      }
    });
    /*this.doughnutChart = new Chart(this.doughnut5.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Luz del ambiente'],
        datasets: [{
          label: '# of Votes',
          data: data_luz_ambi,
          backgroundColor: [
            'rgba(255, 159, 64, 0.2)',
            'rgba(193, 193, 193, 0.5)',
          ],
          hoverBackgroundColor: [
            '#FFCE56',
            '#c1c1c1',
          ]
        }]
      }
    });*/

    this.doughnutChart = new Chart(this.doughnut6.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Presión del ambiente'],
        datasets: [{
          label: '# of Votes',
          data: data_presion,
          backgroundColor: [
            'rgba(20, 143, 119, 0.2)',
            'rgba(193, 193, 193, 0.5)',
          ],
          hoverBackgroundColor: [
            '#148F77',
            '#c1c1c1',
          ]
        }]
      }
    });
  }

  polarAreaMethod() {
    let settings = this.share.getColorsParams('', this.tot_temp_ambi);
    const data = {
      labels: labelsParams,
      datasets: [{
        //label: 'My First Dataset',
        data: [this.tot_hum_tierra ?? 0, /* this.tot_ph,  this.tot_hum_ambi ?? 0,*/ this.tot_temp_ambi ?? 0,/* this.tot_luz_ambi ?? 0,*/ this.tot_presion ?? 0],
        backgroundColor: settings.base,
        hoverBackgroundColor: settings.selected
      }]
    };

    const config = {
      tipo: 'polarArea',
      datos: data,
      opciones: {}
    };

    this.polarArea = new Chart(this.polarAreaCanvas.nativeElement, {
      type: 'polarArea',
      data: data
    });
  }

  async getData() {
    try {
      let jsonObj
      if (sessionStorage.getItem('metricas') == null || sessionStorage.getItem('metricas') == '') {
        const response = await this.nodos.getInformacion().toPromise();
        sessionStorage.setItem('metricas', JSON.stringify(response))
        jsonObj = response;
      } else {
        jsonObj = JSON.parse(sessionStorage.getItem('metricas'));
      }
      if (jsonObj)
        this.calcularValores(jsonObj);

    } catch (ex) {
      console.log(ex);
      if (ex.status == 401) {
        //this.authServ.onIdTokenRevocation();
        this.share.showToastColor('Alerta', 'La sesión a caducado, vuelva a iniciar sesión', 'w', 'm')
        this.router.navigate(['/login']).then(r => { });
      }
    }
  }

  cleanOldData() {
    this.cont = 0;
    this.tot_hum_tierra = 0;
    this.tot_ph = 0;
    this.tot_hum_ambi = 0;
    this.tot_temp_ambi = 0;
    this.tot_luz_ambi = 0;
  }

  calcularValores(jsonObj) {
    try {
      this.cleanOldData()

      Object.keys(jsonObj).forEach((k) => {
        let kDate = this.share.jsonDate(jsonObj[k].fecha);
        if (kDate.mes == this.hoy.mes &&
          kDate.año == this.hoy.año &&
          kDate.dia == this.hoy.dia
        ) {
          this.filtro.push(jsonObj[k]);
        }
      });

      if (this.filtro.length > 0) {
        for (let key of this.filtro) {
          this.cont++;
          let typeParams = key;

          this.tot_hum_tierra += parseFloat(typeParams.parametros_tierra.HT ?? 0);
          /*  this.tot_ph += parseFloat(typeParams.parametros_tierra.PH); */

          this.tot_hum_ambi += parseFloat(typeParams.parametros_ambiente.HA ?? 0);
          this.tot_temp_ambi += parseFloat(typeParams.parametros_ambiente.TA ?? 0);
          this.tot_luz_ambi += parseFloat(typeParams.parametros_ambiente.LA ?? 0);
          this.tot_presion += parseFloat(typeParams.parametros_ambiente.PA ?? 0);

        }
        this.tot_hum_tierra /= this.cont;
        this.tot_hum_tierra = this.share.trunc(this.tot_hum_tierra, 0) ?? 0
        /* this.tot_ph /= this.cont; */
        this.tot_hum_ambi /= this.cont;
        this.tot_hum_ambi = this.share.trunc(this.tot_hum_ambi, 0) ?? 0
        this.tot_temp_ambi /= this.cont;
        this.tot_temp_ambi = this.share.trunc(this.tot_temp_ambi, 0) ?? 0
        this.tot_luz_ambi /= this.cont;
        this.tot_luz_ambi = this.share.trunc(this.tot_luz_ambi, 0) ?? 0
        this.tot_presion /= this.cont;
        this.tot_presion = this.share.trunc(this.tot_presion, 2) ?? 0
      }
    } catch (ex) {
      this.share.showToastColor('No se encontró muestra', 'No hay muestras del día dew hoy: ' + this.fechaCompleta, 'w', 's');
      this.share.stopLoading();
    }
  }

  getDate() {
    let f = new Date();
    this.hoy = this.share.jsonDate(f.toLocaleDateString() + '');
    this.fechaCompleta = this.hoy.dia + "/ " + this.hoy.mes + "/ " + this.hoy.año
  }

  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 1.1,
    autoplay: {
      delay: 1000,
      disableOnInteraction: false,
    },
    speed: 1500,
  };

  async doRefresh(ev) {
    sessionStorage.removeItem('metricas')
    await this.getData()
    this.barChartMethod();
    this.doughnutChartMethod();
    ev.target.complete();
  }

  presentInfo() {
    this.share.presentPopover(InfoCardComponent);
  }
}
