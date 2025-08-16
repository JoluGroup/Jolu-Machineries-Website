export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function send(path: string, data: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const reason = json?.errors?.fieldErrors || json?.message || "Request failed";
    throw new Error(typeof reason === "string" ? reason : JSON.stringify(reason));
  }
  return json;
}

export const api = {
  contact: (data: {
    name: string; email: string; phone: string; county: string; area: string;
    productInterest?: string | null; message: string;
  }) => send("/api/contact", data),
  schedule: (data: {
    name: string; email: string; phone: string; preferredDate: string;
    product: string; notes?: string | null;
  }) => send("/api/schedule", data),
};
