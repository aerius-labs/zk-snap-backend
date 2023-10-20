import { OnEvent } from '@nestjs/event-emitter';
import { ProposalCreatedEvent } from 'src/events/proposal.event';

export class ProposalCreatedListener {
  @OnEvent('proposal.created')
  handleProposalCreatedEvent(event: ProposalCreatedEvent) {
    console.log('ProposalCreatedEvent', event.proposalId);
    // TODO - Generate Agg base proof witness.
    // TODO - Send generated Agg base proof witness to the Aggregator.
  }
}
