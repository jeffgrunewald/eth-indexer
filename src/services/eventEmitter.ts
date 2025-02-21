import { EventEmitter } from 'events';
import { TransferEvent } from '../types';

class TransferEventEmitter extends EventEmitter {
  private static instance: TransferEventEmitter;

  private constructor() {
    super();
  }

  static getInstance(): TransferEventEmitter {
    if (!TransferEventEmitter.instance) {
      TransferEventEmitter.instance = new TransferEventEmitter();
    }
    return TransferEventEmitter.instance;
  }

  emitTransfer(event: TransferEvent) {
    this.emit('transfer', event);
  }
}

export const transferEmitter = TransferEventEmitter.getInstance();
