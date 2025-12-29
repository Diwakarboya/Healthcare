export const API_CONFIG = {
  BASE_URL: 'https://assessment.ksensetech.com/api',
  API_KEY: 'ak_01007954d87ce48e1a2b9513f1b9ecdfb29426eff016c78b',
  ENDPOINTS: {
    PATIENTS: '/patients',
    SUBMIT_ASSESSMENT: '/submit-assessment',
  },
  PAGINATION: {
    MAX_LIMIT: 20,
    DEFAULT_LIMIT: 5,
  },
  RETRY: {
    MAX_RETRIES: 3,
    INITIAL_DELAY: 1000,
    RATE_LIMIT_DELAY: 200,
  },
} as const;

