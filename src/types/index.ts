export interface IndexedTransferEvent {
  from: string;
  to: string;
  value: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
  createdAt: Date;
}

export interface TransferStats {
  totalEvents: number;
  totalTransferred: string;
  lastEventAt: Date;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface EventQueryParams {
  from?: string;
  to?: string;
  startBlock?: number;
  endBlock?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface TransferEvent {
  from: string;
  to: string;
  value: bigint;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
} 