import axiosInstance from "../libs/axios";

export default {
  uploadFile: (formData) => {
    return axiosInstance.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getFile: (filePath) => {
    return axiosInstance.get(`/${filePath}`, {
      responseType: "blob",
    });
  },
};