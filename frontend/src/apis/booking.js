import axiosInstance from "../libs/axios";

export default {
  getBookings: (query) => {
    return axiosInstance.get("/booking", {
      params: query,
    });
  },
  bookingRoom: (req) => {
    return axiosInstance.post(`/booking`, req);
  },
  bookingService: (req) => {
    return axiosInstance.post(`/booking/service`, req);
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
  rejectBooking: (req) => {
    return axiosInstance.put(
      `/booking/${req.param.bookingId}/reject-room-booking`,
      req.body
    );
  },
  undoContract: (req) => {
    return axiosInstance.put(
      `/booking/${req.param.bookingId}/undo-contract`
    );
  },
  userSignTheContract: (req) => {
    return axiosInstance.put(
      `/booking/${req.param.bookingId}/sign-contract`,
      req.body
    );
  },
  confirmBookingService: (req) => {
    return axiosInstance.put(
      `/booking/service/${req.param.id}/confirm`
    );
  },
  rejectServiceBooking: (req) => {
    return axiosInstance.put(
      `/booking/service/${req.param.id}/reject`,
      req.body
    );
  }
};
