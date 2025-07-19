import axios from "axios";
import { normalizeClientData } from "../utils/clientUtils";

export const login = async (credentials) => {
  const response = await axios.post("/api/login", credentials);
  return response.data;
};

export const fetchClients = async (token) => {
  const response = await axios.get("/api/clients", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return normalizeClientData(response.data);
};

export const fetchStatistics = async (token) => {
  try {
    const [dailyRes, topRes] = await Promise.all([
      axios.get("/api/stats/daily-sales", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("/api/stats/top-clients", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    console.log("Resposta de /api/stats/daily-sales:", dailyRes.data); // Log para depuração
    console.log("Resposta de /api/stats/top-clients:", topRes.data); // Log para depuração
    return {
      dailySales: Array.isArray(dailyRes.data) ? dailyRes.data : [],
      topClients: {
        highestVolume: topRes.data.highestVolume || null,
        highestAverage: topRes.data.highestAverage || null,
        mostFrequent: topRes.data.mostFrequent || null,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return {
      dailySales: [],
      topClients: {
        highestVolume: null,
        highestAverage: null,
        mostFrequent: null,
      },
    };
  }
};

export const addClient = async (client, token) => {
  await axios.post("/api/clients", client, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addSale = async (sale, token) => {
  await axios.post("/api/sales", sale, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateClient = async (client, token) => {
  await axios.put(`/api/clients/${client.id}`, client, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteClient = async (id, token) => {
  await axios.delete(`/api/clients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
