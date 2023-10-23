export interface NewProposalDto {
  id?: string;
  creator: string;
  title: string;
  description: string;
  dao_id: string;
  start_time: Date;
  end_time: Date;
  voting_options: string[];
}

export interface UpdateProposalDto {
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  voting_options: string[];
  proof_nonce: string;
}
