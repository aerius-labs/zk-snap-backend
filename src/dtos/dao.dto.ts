export interface NewDaoDto {
  id?: string;
  name: string;
  description: string;
  logo?: string;
  membersRoot?: string;
  members: string[];
}

export interface UpdateDaoDto {
  name: string;
  description: string;
  logo: string;
  members: string[];
}
