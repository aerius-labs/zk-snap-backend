export interface ProposalDto {
    id?: string;
    creator: string;
    description: string;
    dao_id: string;
    start_time: Date;
    end_time: Date;
    voting_options: string[];
    status: 'NOT_STARTED' | 'ON_GOING' | 'FINISHED';
    result: number[];
}