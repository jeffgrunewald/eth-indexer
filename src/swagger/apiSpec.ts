/* eslint-disable import/no-anonymous-default-export */
export default {
  openapi: '3.0.0',
  info: {
    title: 'ERC-20 Transfer Event Indexer API',
    version: '1.0.0',
    description: 'API for querying indexed ERC-20 transfer events'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server'
    }
  ],
  tags: [
    {
      name: 'Events',
      description: 'Transfer event operations'
    },
    {
      name: 'Stats',
      description: 'Transfer statistics'
    }
  ],
  components: {
    schemas: {
      TransferEvent: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'Sender address'
          },
          to: {
            type: 'string',
            description: 'Recipient address'
          },
          value: {
            type: 'string',
            description: 'Transfer amount'
          },
          transaction_hash: {
            type: 'string',
            description: 'Transaction hash'
          },
          block_number: {
            type: 'integer',
            description: 'Block number'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Transfer timestamp'
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Record creation timestamp'
          }
        }
      },
      TransferStats: {
        type: 'object',
        properties: {
          totalEvents: {
            type: 'integer',
            description: 'Total number of transfer events'
          },
          totalTransferred: {
            type: 'string',
            description: 'Total amount transferred'
          },
          lastEventAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp of the last transfer event'
          }
        }
      }
    }
  }
}; 