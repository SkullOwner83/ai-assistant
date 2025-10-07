import { useEffect, useState } from "react";
import axios from "axios";
import type { Config } from "../interfaces/config";

export const useConfig = () => {
    const [config, setConfig] = useState<Config>({apiKey: '', aiProvider: '', openaiModel: '', hfModel: ''});
    useEffect(() => { loadConfig()}, [])
    
    const loadConfig = async () => {
        try {
            const response = await axios.get("http://localhost:8000/configuration");
        
            if (response.status === 200) {
                setConfig({ ...response.data });
            }
        } catch (error) {
            console.error("Error al cargar la configuración", error);
        }
    }

    const saveConfig = async (newConfig: Config) => {
        try {
            const response = await axios.post("http://localhost:8000/configuration", newConfig);
        
            if (response.status === 204) {
                setConfig({ ...newConfig });
            }
        } catch (error) {
            console.error("Error al guardar la configuración", error);
        }
    }

    return {
        config,
        setConfig,
        loadConfig,
        saveConfig
    }
}