import { TransferEventListener } from '../services/transferEventListener';

async function main() {
  const listener = new TransferEventListener();

  await listener.start();
}

main().catch(console.error); 