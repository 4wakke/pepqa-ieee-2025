import axios from "axios";

const backRoute = import.meta.env.VITE_APP_BACK_ROUTE_PEPQA;


const client = axios.create({
  baseURL: `${backRoute}/api`,
  withCredentials: true,
});

export default client;