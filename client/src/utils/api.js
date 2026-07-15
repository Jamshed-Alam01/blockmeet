import axios from "axios";

const BACKEND_URL = `http://${window.location.hostname}:3001`;

// Axios instance jo saari requests ke liye use hoga
const api = axios.create({
  baseURL: BACKEND_URL,
});

// Interceptor — har request jaane se pehle, agar token localStorage mein hai,
// use automatically Authorization header mein daal do
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (identifier, password) =>
  api.post(`/signup/register`, { identifier, password });


export const verifyOtp = (identifier, otp) =>
  api.post(`/signup/verify-otp`, { identifier, otp });







export const loginUser = (identifier, password) =>
  api.post(`/signup/login`, { identifier, password });




export const getNonce = (walletAddress) =>
  api.post(`/auth/nonce`, { walletAddress });

export const verifyWallet = (walletAddress, signature, identifier) =>
  api.post(`/auth/verify`, { walletAddress, signature, identifier });

export const createMeeting = (walletAddress) =>
  api.post(`/meeting/create`, { walletAddress });

export const checkMeeting = (meetingId) =>
  api.get(`/meeting/${meetingId}`);

export default BACKEND_URL;