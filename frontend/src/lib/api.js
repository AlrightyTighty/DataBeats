const API = import.meta.env.MODE == "development" ? "http://localhost:5062" : "https://databeats-backend-63991322723.us-south1.run.app";
export default API;

/*const API = import.meta.env?.VITE_API || "http://localhost:5062";
export default API;*/
