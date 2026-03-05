// Column index constants — map to Google Sheets column positions (0-based)

export const ATT = {
  NAME: 0,       // Player Name
  LOCATION: 1,   // Location
  MONTH: 2,      // Month string
  DATE: 3,       // Session Date (DD/MM/YYYY)
  COST: 4,       // Cost Per session
  PLAYER_ID: 5,  // Player ID
  MEMBERSHIP: 6, // Membership status string
  SURCHARGE: 7,  // Surcharge amount
} as const;

export const SUM = {
  NAME: 1,
  PENDING: 2,
  PREPAY: 3,
  TOTAL: 4,
  LAST_PAID_DATE: 7,
  LAST_PAID_AMT: 8,
  COVERED_UNTIL: 9,
} as const;

export const PAY = {
  DATE: 0,
  NAME: 1,
  PLAYER_ID: 2,
  COMMENT: 3,
  REFERENCE: 4,
  TXN_DATE: 5,
  FROM: 6,
  TO: 7,
  ACCOUNT: 8,
  AMOUNT: 9,
  REMARKS: 10,
  PREPAYMENT: 11,
} as const;

export const SESSION = {
  DATE: 0,
  FIELD_COST: 6,
} as const;

export const MONTH_ORDER: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

export const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export const TRACKING_START_DATE = new Date(2024, 6, 1); // July 1, 2024

export const SESSION_COST = 700; // MVR — default if not in Session Input sheet

export const ADMIN_AUTH_KEY = 'ufaAdminAuth';

export const PAYMENT_ACCOUNT = '7730000682000';
export const PAYMENT_ACCOUNT_NAME = 'MOHD. AMSAL';

export const SHEETS_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
