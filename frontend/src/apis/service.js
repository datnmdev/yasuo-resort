import axiosInstance from "../libs/axios";

export default {
  getServices: (query) => {
    return axiosInstance.get("/service", {
      params: query,
    });
  },
  createService: (body) => {
    return axiosInstance.post("/service", body);
  },
  updateService: (req) => {
    return axiosInstance.put(`/service/${req.param.serviceId}`, req.body);
  },
  deleteService: (param) => {
    return axiosInstance.delete(`/service/${param.serviceId}`);
  },
  cancelBookedService: (param) => {
    return axiosInstance.put(`/booking/service/${param.serviceId}/cancel`);
  },
  updateBookedService: (param, body) => {
    return axiosInstance.put(`/booking/service/${param.serviceId}`, body);
  },
  getReCommendServices: (query) => {
    return axiosInstance.get('/recommender/service', {
      params: query
    })
  }
};
