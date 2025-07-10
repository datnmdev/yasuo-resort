import axiosInstance from "../libs/axios";

export default {
  getRoomTypes: (query) => {
    return axiosInstance().get("/room-type", {
      params: query,
    });
  },
  createRoomType: (body) => {
    return axiosInstance().post("/room-type", body);
  },
  updateRoomType: (req) => {
    return axiosInstance().put(`/room-type/${req.param.roomTypeId}`, req.body);
  },
  deleteRoomType: (param) => {
    return axiosInstance().delete(`/room-type/${param.roomTypeId}`);
  },
};
