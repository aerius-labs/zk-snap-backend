import axios from 'axios';
import { WithnessToAggregator } from 'src/dtos/baseProofGeneration.dto';

export async function generateAggregatorBaseProof(
  withness: WithnessToAggregator,
  aggregatorUrl: string,
) {
  try {
    const aggBaseWitness = withness.witness;

    await postAggregatorData(aggBaseWitness, withness.proposalIdStr, aggregatorUrl);
    console.log('Aggregator Base Proof generated successfully');
  } catch (error) {
    console.error('Error generating Aggregator Base Proof:', error);
  }
}

async function postAggregatorData(
  aggBaseWitness: string,
  proposalId: string,
  aggregatorUrl: string,
) {
  // TODO:- add mirco service here
  try {
    const response = await axios.post(
      aggregatorUrl,
      {
        type: 'base',
        witness: aggBaseWitness,
        proposalId: proposalId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error while posting Aggregator data: ', error);
  }
}
