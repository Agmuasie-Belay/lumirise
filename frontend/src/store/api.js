export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token"); 
  console.log(token)
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }), 
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "API request failed");

  return data;
};
