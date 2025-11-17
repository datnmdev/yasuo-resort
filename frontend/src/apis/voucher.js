import axiosInstance from "../libs/axios";
export default {
    createVoucher: (data) => {
        return axiosInstance.post('/voucher', data);
    },
    getVouchersForAdmin: (params = {}) => {
        return axiosInstance.get('/voucher/admin', { params });
    },
    updateVoucher: (voucherId, data) => {
        return axiosInstance.put(`/voucher/${voucherId}`, data);
    },
    toggleVoucherStatus: (voucherId, isActive) => {
        return axiosInstance.put(`/voucher/publication/${voucherId}`, {
            isActive: isActive ? 0 : 1
        });
    },
    deleteVoucher: (id) => {
        return axiosInstance.delete(`/voucher/${id}`);
    }
};
