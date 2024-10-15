import axios, { AxiosInstance } from 'axios';
const PORT = process.env.USERSERVICEPORT
class Communicator {
    userServiceClient: AxiosInstance;
    constructor() {
        this.userServiceClient = axios.create({ baseURL: `http://localhost:${PORT}/api` });
    }

    async getUsers() {
        const response = await this.userServiceClient.get('/users');
        return response.data;
    }
}

export default new Communicator();
