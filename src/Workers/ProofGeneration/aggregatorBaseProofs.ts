import axios from 'axios';
import { WithnessToAggregator } from 'src/dtos/baseProofGeneration.dto';

export async function generateAggregatorBaseProof(
  withness: WithnessToAggregator,
  aggregatorUrl: string,
) {
  try {
    const aggBaseProof = withness.witness;

    postAggregatorData(aggBaseProof, withness.proposalIdStr, aggregatorUrl);
    console.log('Aggregator Base Proof generated successfully');
  } catch (error) {
    console.error('Error generating Aggregator Base Proof:', error);
  }
}

async function postAggregatorData(
  aggBaseProof: string,
  proposalId: string,
  aggregatorUrl: string,
) {
  // TODO:- add mirco service here
  try {
    const response = await axios.post(
      aggregatorUrl,
      {
        type: 'base',
        witness: aggBaseProof,
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
