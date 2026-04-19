export interface ClientPhone {
  id: string;
  number: string;
}

export interface Client {
  id: string;
  name: string;
  personType: string;
  document: string | null;
  isActive: boolean;
  phones: ClientPhone[];
}

export interface CreateClient {
  name: string;
  personType: string;
  document?: string | null;
  phones?: { number: string }[];
}

export interface UpdateClient {
  name?: string;
  personType?: string;
  document?: string | null;
  isActive?: boolean;
  phones?: { id?: string; number: string }[];
}
