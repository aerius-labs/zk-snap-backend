import { workerData } from 'worker_threads';
import { generateAggregatorBaseProof, postAggregatorData } from './ProofGeneration/aggregatorBaseProofs';

const { parentPort } = require('worker_threads');
import { aggregateVote } from 'src/utils/generate-witness';

parentPort.on('message', async (message) => {
  console.log('message', message);
  if (message.type === 'PROPOSAL_CREATED') {
    console.log(`Proposal created ${message.value} message from worker`);
    generateAggregatorBaseProof(message.value, workerData.aggregatorURL);
  }
  if (message === 'PROPOSAL_UPDATED') {
    console.log('Proposal updated message from worker');
  }
  if (message.type === 'USER_VOTED') {
    const { proposalData, vote, zkProof } = message.value;

    try {
      const witness = await aggregateVote(proposalData, vote, zkProof);

      postAggregatorData(
        witness,
        proposalData.proposalIdStr,
        workerData.aggregatorURL,
        'recursive',
      );
    } catch (error) {
      console.error('Error while witness generation: ', error);
    }
    console.log('User voted message from worker');
  }
});
