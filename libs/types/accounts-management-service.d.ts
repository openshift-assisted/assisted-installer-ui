export interface AccessTokenCfg {
  auths: Record<string, Record<'email' | 'auth', string>>;
}
