import axios from 'axios';

const BASE = 'https://mytripmychoice-backend-production.up.railway.app/api';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const login = (data) => axios.post(`${BASE}/auth/login`, data);
export const signup = (data) => axios.post(`${BASE}/auth/signup`, data);
export const generateTrip = (data) => axios.post(`${BASE}/trips/generate`, data, getHeaders());
export const getMyTrips = () => axios.get(`${BASE}/trips/my-trips`, getHeaders());
export const createOrder = (amount) => axios.post(`${BASE}/payment/create-order`, { amount }, getHeaders());
export const verifyPayment = (data) => axios.post(`${BASE}/payment/verify`, data, getHeaders());
export const getProfile = () => axios.get(`${BASE}/auth/profile`, getHeaders());