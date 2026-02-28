import axios from "axios";

export const dashboardApi = {
  getChallengeLeaderboard: async (id: string) => {
    const res = await axios.get(`/api/challenges/${id}/leaderboard`);
    return res.data;
  },
};