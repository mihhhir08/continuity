export async function createJob(baseUrl: string) {
  const response = await fetch(`${baseUrl}/v1/jobs`, { method: "POST" });
  if (!response.ok) throw new Error(`request failed: ${response.status}`);
  return response.json();
}
