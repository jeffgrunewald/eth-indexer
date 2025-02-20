import { ethers } from 'ethers';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { insertTransferEvent, getLatestSavedBlock } from '../db/queries';

dotenv.config();

// ERC-20 ABI for Transfer event
const ERC20_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
];

const MAX_BLOCK_RANGE = 1000;

export class TransferEventListener {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private pool: Pool;

  constructor() {
    if (!process.env.SEPOLIA_RPC_URL) throw new Error('SEPOLIA_RPC_URL not set');
    if (!process.env.ERC20_CONTRACT_ADDRESS) throw new Error('ERC20_CONTRACT_ADDRESS not set');
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');

    this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    this.contract = new ethers.Contract(process.env.ERC20_CONTRACT_ADDRESS, ERC20_ABI, this.provider);
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  private async fetchHistoricalEvents(startBlock: number) {
    // Get latest block from chain
    const latestBlock = await this.provider.getBlockNumber();
    // Calculate total blocks to process
    const totalBlocks = latestBlock - startBlock;
    
    const filter = this.contract.filters.Transfer();

    if (totalBlocks <= MAX_BLOCK_RANGE) {
      // If range is small enough, fetch directly
      const events = await this.contract.queryFilter(
        filter,
        startBlock,
        latestBlock
      );
      await this.processEvents(events);
      return;
    }

    // Otherwise chunk through blocks
    let currentStart = startBlock;
    while (currentStart < latestBlock) {
      const currentEnd = Math.min(currentStart + MAX_BLOCK_RANGE, latestBlock);
      console.log(`Fetching events from blocks ${currentStart} to ${currentEnd}`);

      try {
        const events = await this.contract.queryFilter(
          filter,
          currentStart,
          currentEnd
        );
        await this.processEvents(events);
      } catch (error) {
        console.error(`Error fetching events for block range ${currentStart}-${currentEnd}:`, error);
      }

      currentStart = currentEnd + 1;
    }
  }

  async start() {
    console.log('Starting transfer event listener...');
      // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('Killing transfer event listener...');
      await this.stop();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('Stopping transfer event listener...');
      await this.stop();
      process.exit(0);
    });

    // Get the starting block number if any
    const lastSavedBlock = await getLatestSavedBlock(this.pool);
    const startBlockEnv = process.env.START_BLOCK_NUMBER ? Number(process.env.START_BLOCK_NUMBER) : null;
    const startBlockNumber = (lastSavedBlock && startBlockEnv) ? Math.max(lastSavedBlock, startBlockEnv) : lastSavedBlock || startBlockEnv;
    
    if (startBlockNumber) {
      console.log(`Processing historical events from block ${startBlockNumber}`);
      await this.fetchHistoricalEvents(startBlockNumber);
    }

    console.log('Setting up live event listener...');
    this.contract.on("Transfer", async (from: string, to: string, value: bigint, event: ethers.ContractEventPayload) => {
      try {
        const block = await this.provider.getBlock(event.log.blockNumber);
        if (!block) throw new Error(`Block ${event.log.blockNumber} not found`);

        await insertTransferEvent(this.pool, {
          from,
          to,
          value,
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
          timestamp: block.timestamp
        });

        console.log(`Saved transfer event: ${event.log.transactionHash}`);
      } catch (error) {
        console.error('Error processing live transfer event:', error);
      }
    });
  }

  async stop() {
    this.contract.removeAllListeners();
    await this.pool.end();
  }

  private async processEvents(events: (ethers.EventLog | ethers.Log)[]) {
    for (const event of events) {
      try {
        const block = await this.provider.getBlock(event.blockNumber);
        if (!block) throw new Error(`Block ${event.blockNumber} not found`);

        const eventLog = event as ethers.EventLog;
        const [from, to, value] = eventLog.args;

        await insertTransferEvent(this.pool, {
          from,
          to,
          value,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: block.timestamp
        });

        console.log(`Saved historical transfer event: ${event.transactionHash}`);
      } catch (error) {
        console.error('Error processing historical transfer event:', error);
      }
    }
  }
}