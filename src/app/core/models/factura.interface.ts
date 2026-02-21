export interface Factura {
  id: number;
  numeroFactura: string;
  idSesion: number;
  idCliente?: number;
  fechaEmision: string;
  baseImponible10: number;
  cuotaIva10: number;
  baseImponible21: number;
  cuotaIva21: number;
  importeLudoteca: number;
  total: number;
  totalPagado: number;
  estado: 'EMITIDA' | 'PAGADA' | 'ANULADA';
  notas?: string;
}
