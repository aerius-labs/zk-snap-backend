export interface NewDaoDto {
  id?: string;
  name: string;
  description: string;
  logo?: string;
  membersRoot: string;
}

export interface UpdateDaoDto {
  name: string;
  description: string;
  logo: string;
  membersRoot: string;
}
