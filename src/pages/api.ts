import references from '../data/api.json';

export async function GET(): Promise<Response> {
  return new Response(JSON.stringify(references, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
