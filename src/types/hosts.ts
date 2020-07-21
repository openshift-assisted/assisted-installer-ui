export type Validation = {
  id: string;
  status: 'success' | 'failure' | 'pending';
  message: string;
};

export type ValidationsInfo = {
  hardware?: Validation[];
  network?: Validation[];
  role?: Validation[];
};
