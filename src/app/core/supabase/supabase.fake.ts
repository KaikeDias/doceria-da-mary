import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { Supabase } from './supabase';

export interface FakeRequest {
  readonly method: string;
  readonly url: URL;
  readonly body: unknown;
}

// Client real do supabase-js com fetch falso, para os testes não acessarem a rede.
// `respond` devolve o JSON da resposta (status 200) ou um Response pronto; lançar simula falha de rede.
export function fakeSupabase(respond: (request: FakeRequest) => unknown) {
  const requests: FakeRequest[] = [];
  const fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(input instanceof Request ? input.url : input);
    const raw = init?.body;
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const request = { method: init?.method ?? 'GET', url, body };
    requests.push(request);
    const result = await respond(request);
    return result instanceof Response ? result : Response.json(result ?? null);
  };
  const client = createClient<Database>('https://teste.supabase.co', 'chave-publishable', {
    global: { fetch },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { requests, client, provider: { provide: Supabase, useValue: { client } } };
}

export function failure(status = 500, body: object = { message: 'falha' }): Response {
  return Response.json(body, { status });
}
