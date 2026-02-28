import axios from "axios";

export const challengeApi = {
  getById: async (id: string) => {
    const res = await axios.get(`/api/challenges/${id}`);
    return res.data;
  },

  join: async (id: string) => {
    const res = await axios.post(`/api/challenges/${id}/join`);
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await axios.patch(`/api/challenges/${id}`, { status });
    return res.data;
  },
};