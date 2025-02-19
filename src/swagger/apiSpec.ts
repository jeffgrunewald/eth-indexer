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
      },
      Pagination: {
        type: 'object',
        properties: {
          currentPage: {
            type: 'integer',
            description: 'Current page number'
          },
          pageSize: {
            type: 'integer',
            description: 'Number of items per page'
          },
          totalPages: {
            type: 'integer',
            description: 'Total number of pages'
          },
          totalItems: {
            type: 'integer',
            description: 'Total number of items across all pages'
          }
        }
      }
    }
  },
  paths: {
    "/api/events": {
      get: {
        summary: "Get paginated transfer events",
        description: "Returns paginated transfer events. If no filters are specified, returns events from the 100th most recent block onwards.",
        parameters: [
          {
            name: "from",
            in: "query",
            description: "Filter by sender address. If specified, ignores default block range.",
            required: false,
            schema: { type: "string" }
          },
          {
            name: "to",
            in: "query",
            description: "Filter by recipient address. If specified, ignores default block range.",
            required: false,
            schema: { type: "string" }
          },
          {
            name: "startBlock",
            in: "query",
            description: "Filter by starting block number. If not specified and no addresses given, defaults to 100th latest block.",
            required: false,
            schema: { type: "integer" }
          },
          {
            name: "endBlock",
            in: "query",
            description: "Filter by ending block number",
            required: false,
            schema: { type: "integer" }
          },
          {
            name: "page",
            in: "query",
            description: "Page number",
            required: false,
            schema: { type: "integer", default: 1 }
          },
          {
            name: "pageSize",
            in: "query",
            description: "Number of items per page",
            required: false,
            schema: { type: "integer", default: 10 }
          }
        ],
        responses: {
          "200": {
            description: "Successful response with paginated transfer events",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { "$ref": "#/components/schemas/TransferEvent" }
                    },
                    pagination: { "$ref": "#/components/schemas/Pagination" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/stats": {
      get: {
        summary: "Get transfer statistics",
        description: "Returns aggregate statistics about all indexed transfer events",
        responses: {
          "200": {
            description: "Successful response with transfer statistics",
            content: {
              "application/json": {
                schema: {
                  "$ref": "#/components/schemas/TransferStats"
                }
              }
            }
          }
        },
        tags: ["Stats"]
      }
    }
  }
}; 