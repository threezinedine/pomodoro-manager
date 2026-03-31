import 'dotenv/config';

export const PORT = parseInt(process.env.PORT ?? '3000', 10);
export const AUTH_TOKEN = process.env.AUTH_TOKEN ?? '';
export const DATABASE_URL = process.env.DATABASE_URL ?? '';
export const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';
