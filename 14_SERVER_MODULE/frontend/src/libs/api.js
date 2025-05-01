import axios from "axios"

const api = axios.create({
    baseURL: "localhost:8000/api/v1",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
})


export default api