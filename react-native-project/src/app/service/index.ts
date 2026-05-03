// Re-export all services
export { 
  executeQuery, 
  fetchRecord, 
  fetchRecords, 
  insertRecord, 
  updateRecord, 
  deleteRecord, 
  upsertRecord 
} from './queryHelper';

export { 
  processLicensePlate, 
  recognizePlateNumber 
} from './lprService';

export { 
  default as cardReaderService, 
  CardReaderService, 
  type CardReaderEvent, 
  type LPRPlateInfo, 
  type StandardizedPlateCode, 
  type CardReaderEventCallback 
} from './cardReaderService';
