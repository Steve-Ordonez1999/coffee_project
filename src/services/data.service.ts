import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { SharedService } from './shared.services';
//import { ExportAsService, ExportAsConfig } from 'ngx-export-as';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private share: SharedService,
    // private exportAsService: ExportAsService
  ) { }

  async exportToExcel(data, filename) {
    try {
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, filename);
      XLSX.writeFile(wb, filename + '.xlsx');

    } catch (ex) {
      this.share.showToastColor('', ex, 'w', 'l');
    }
  }

}

export interface tableDataset {
  DISPOSITIVO: string;
  //usuario: string;
  FECHA_HORA: string;
  HUMEDAD: string;
  /*  PH_tierra: string; */
  /*Humedad_ambiente: string;*/
  /*Luz_ambiente: string;*/
  TEMPERATURA: string;
  PRESIÓN: string;
}
