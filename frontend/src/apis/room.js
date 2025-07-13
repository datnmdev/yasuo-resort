import axiosInstance from "../libs/axios";

export default {
  getRooms: (query) => {
    return axiosInstance.get("/room", {
      params: query,
    });
  },
  createRoom: (body) => {
    return axiosInstance.post("/room", body);
  },
  updateRoom: (req) => {
    return axiosInstance.put(`/room/${req.param.roomId}`, req.body);
  },
  deleteRoom: (param) => {
    return axiosInstance.delete(`/room/${param.roomId}`);
  },
};
