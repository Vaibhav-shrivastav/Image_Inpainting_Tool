import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // Backend URL

// Upload image
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${API_BASE_URL}/upload-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// Fetch all images
export const getImages = async () => {
  const response = await axios.get(`${API_BASE_URL}/images`);
  return response.data;
};

// Upload mask for an image
export const uploadMask = async (imageId: number, maskFile: File) => {
  const formData = new FormData();
  formData.append("file", maskFile);

  const response = await axios.post(`${API_BASE_URL}/upload-mask/${imageId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// Fetch single image details
export const getImageById = async (imageId: number) => {
  const response = await axios.get(`${API_BASE_URL}/image/${imageId}`);
  return response.data;
};
