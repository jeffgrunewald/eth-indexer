import { TransferEventListener } from '../services/transferEventListener';

async function main() {
  const listener = new TransferEventListener();
  
  process.on('SIGINT', async () => {
    console.log('Stopping service...');
    await listener.stop();
    process.exit(0);
  });

  await listener.start();
}

main().catch(console.error); 