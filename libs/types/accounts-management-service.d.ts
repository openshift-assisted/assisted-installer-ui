export interface ObjectReference {
  href?: string;
  id?: string;
  kind?: string;
}

export type AccessTokenCfg = {
  auths: Record<string, Record<'email' | 'auth', string>>;
};

export type Account = ObjectReference & {
  ban_code?: string;
  ban_description?: string;
  banned?: boolean;
  capabilities?: Array<Capability>;
  created_at?: string;
  email?: string;
  first_name?: string;
  labels?: Array<Label>;
  last_name?: string;
  organization?: Organization;
  organization_id?: string;
  rhit_account_id?: string;
  rhit_web_user_id?: string;
  service_account?: boolean;
  updated_at?: string;
  username: string;
};

export type Organization = ObjectReference & {
  capabilities?: Array<Capability>;
  created_at?: string;
  ebs_account_id?: string;
  external_id?: string;
  labels?: Array<Label>;
  name?: string;
  updated_at?: string;
};

export type Capability = ObjectReference & {
  inherited: boolean;
  name: string;
  value: string;
};

export type Label = ObjectReference & {
  account_id?: string;
  created_at?: string;
  internal: boolean;
  key: string;
  organization_id?: string;
  subscription_id?: string;
  type?: string;
  updated_at?: string;
  value: string;
};

export type ApiError = ObjectReference & {
  code?: string;
  operation_id?: string;
  reason?: string;
};
