import { Dao } from 'src/entities/dao.entity';
import { Proposal } from 'src/entities/proposal.entity';

export function extractProposalDetails(proposals: Proposal[]) {
  return proposals.map((proposal) => {
    return {
      creator: proposal.creator,
      title: proposal.title,
      description: proposal.description,
      end_time: proposal.end_time,
    };
  });
}

export function extractDaoDetails(dao: Dao, proposals: Proposal[]) {
  return {
    daoName: dao.name,
    daoLogo: dao.logo,
    daoMemberCount: Array.isArray(dao.members) ? dao.members.length : 0,
    daoProposals: extractProposalDetails(proposals),
  };
}
