import axiosInstance from '../libs/axios';

export default {
  getStatisticRevenueData: (query) => {
    return axiosInstance.get('/statistics/revenue', {
      params: query,
    });
  },
};
