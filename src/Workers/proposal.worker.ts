import { workerData } from 'worker_threads';
import { generateAggregatorBaseProof } from './ProofGeneration/aggregatorBaseProofs';

const { parentPort } = require('worker_threads');
import { RabbitMQService } from '../services/rabbitmq.service';

// Initialize the RabbitMQService
const rabbitMQService = new RabbitMQService();
rabbitMQService.onModuleInit().then(() => {
    console.log('RabbitMQ Worker: Connected to RabbitMQ');
}).catch(err => {
    console.error('RabbitMQ Worker: Failed to connect to RabbitMQ', err);
    process.exit(1); // Exit if connection fails
});


parentPort.on('message', (message) => {
  console.log('message', message);
  if (message.type === 'PROPOSAL_CREATED') {
    console.log(`Proposal created ${message.value} message from worker`);
    generateAggregatorBaseProof(message.value, workerData.aggregatorURL);
  }

  if (message === 'PROPOSAL_UPDATED') {
    console.log('Proposal updated message from worker');
  }
  if (message.type === 'USER_VOTED') {

    const { voteProof, proposalId } = message.data;
    try {
      rabbitMQService.sendToQueue({
        voteProof,
        proposalId,
      });
      console.log('vote sent to queue');
    } catch (error) {
        console.error('Error while sending vote to queue: ', error);
    }
    console.log('User voted message from worker');

  }
});
