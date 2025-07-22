import axiosInstance from "../libs/axios";

export default {
  getBookings: (query) => {
    return axiosInstance.get("/booking", {
      params: query,
    });
  },
  createContract: (req) => {
    return axiosInstance.put(
      `/booking/${req.param.bookingId}/create-contract`
    );
  },
  cancelBooking: (req) => {
    return axiosInstance.put(
      `/booking/${req.param.bookingId}/cancel-room-booking`
    );
  },
  userSignTheContract: (req) => {
    return axiosInstance.put(
      `/booking/${req.param.bookingId}/sign-contract`,
      req.body
    );
  },
};
