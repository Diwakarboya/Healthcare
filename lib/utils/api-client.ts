import { API_CONFIG } from '@/lib/config/api';
import type { Patient, PaginatedResponse } from '@/lib/types/patient';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

interface RetryOptions {
  maxRetries?: number;
  delay?: number;
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const { maxRetries = API_CONFIG.RETRY.MAX_RETRIES, delay = API_CONFIG.RETRY.INITIAL_DELAY } =
    retryOptions;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : delay * (attempt + 1);
        await sleep(waitTime);
        continue;
      }

      if (response.status === 500 || response.status === 503) {
        if (attempt < maxRetries - 1) {
          await sleep(delay * (attempt + 1));
          continue;
        }
      }

      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      await sleep(delay * (attempt + 1));
    }
  }

  throw new Error('Max retries exceeded');
}

export async function fetchAllPatients(): Promise<Patient[]> {
  const allPatients: Patient[] = [];
  let page = 1;
  let totalPages = 0;

  while (true) {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PATIENTS}?page=${page}&limit=${API_CONFIG.PAGINATION.MAX_LIMIT}`;

    console.log(`Fetching page ${page}...`);

    const response = await fetchWithRetry(url, {
      headers: {
        'x-api-key': API_CONFIG.API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch patients: ${response.statusText}`);
    }

    const data: PaginatedResponse = await response.json();

    if (data.pagination?.totalPages) {
      totalPages = data.pagination.totalPages;
      if (page === 1) {
        console.log(`Total pages: ${totalPages}, Total patients: ${data.pagination?.total ?? 'unknown'}`);
      }
    }

    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.log(`Page ${page}: No data returned, stopping pagination`);
      break;
    }

    allPatients.push(...data.data);
    console.log(`Page ${page}: Fetched ${data.data.length} patients (Total so far: ${allPatients.length})`);

    const hasNext = data.pagination?.hasNext ?? false;
    const currentPage = data.pagination?.page ?? page;

    if (totalPages > 0) {
      if (currentPage >= totalPages) {
        console.log(`Reached last page (${currentPage}/${totalPages})`);
        break;
      }
    } else if (!hasNext) {
      console.log(`hasNext is false, stopping pagination`);
      break;
    }

    page++;

    await sleep(API_CONFIG.RETRY.RATE_LIMIT_DELAY);
  }

  console.log(`Finished fetching. Total patients: ${allPatients.length}`);
  return allPatients;
}

function createHttpClient(): AxiosInstance {
  return axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY,
    },
  });
}

async function withRetry<T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  operation: string,
  maxRetries: number = API_CONFIG.RETRY.MAX_RETRIES,
  delay: number = API_CONFIG.RETRY.INITIAL_DELAY
): Promise<AxiosResponse<T>> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await requestFn();
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 429) {
          const retryAfter = error.response?.headers['retry-after'];
          const waitTime = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : delay * (attempt + 1);
          console.log(`${operation}: Rate limited, waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
          await sleep(waitTime);
          continue;
        }

        if (status === 500 || status === 503) {
          if (attempt < maxRetries - 1) {
            console.log(`${operation}: Server error ${status}, retrying ${attempt + 1}/${maxRetries}`);
            await sleep(delay * (attempt + 1));
            continue;
          }
        }
      }

      if (attempt === maxRetries - 1) {
        throw error;
      }

      await sleep(delay * (attempt + 1));
    }
  }

  throw new Error(`${operation}: Max retries exceeded`);
}

export async function submitAssessment(
  payload: {
    high_risk_patients: string[];
    fever_patients: string[];
    data_quality_issues: string[];
  }
): Promise<Record<string, unknown>> {
  const http = createHttpClient();
  
  console.log('Submitting payload (as object):', payload);

  const response = await withRetry<Record<string, unknown>>(
    () => http.post('/submit-assessment', payload),
    'POST /submit-assessment'
  );

  return response.data;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

