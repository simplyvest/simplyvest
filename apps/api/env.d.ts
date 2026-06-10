export interface Env {
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  GOOGLE_SHEET_ID: string;
  GOOGLE_SHEET_NAME?: string;
  DB: D1Database;
  SOLANA_RPC_URL?: string;
  PLATFORM_SECRET_KEY?: string;
  PRIVY_APP_ID?: string;
  PRIVY_APP_SECRET?: string;
  TOKEN_ASSETS: R2Bucket;
}
