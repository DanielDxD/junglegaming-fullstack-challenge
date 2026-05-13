import { env } from "@/config/env";
import axios, { AxiosError, AxiosInstance } from "axios";

export abstract class ApiService {
    protected readonly api: AxiosInstance

    public constructor(basePath = "/") {
        this.api = axios.create({
            baseURL: `${env.NEXT_PUBLIC_API_URL}${basePath}`
        });

        this.api.interceptors.request.use((config) => {
            if (typeof window !== 'undefined') {
                const oidcStorage = sessionStorage.getItem(`oidc.user:http://localhost:8080/realms/crash-game:crash-game-client`);
                if (oidcStorage) {
                    const user = JSON.parse(oidcStorage);
                    if (user && user.access_token) {
                        config.headers.Authorization = `Bearer ${user.access_token}`;
                    }
                }
            }
            return config;
        });
    }

    public getErrorMessage(e: Error | AxiosError) {
        if (axios.isAxiosError(e)) {
            return e.response?.data?.message || "An error ocurred. Please, try again."
        }

        return "An error ocurred. Please, try again."
    }
}