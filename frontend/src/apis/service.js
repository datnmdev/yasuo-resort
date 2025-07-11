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
};
