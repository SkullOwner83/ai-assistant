import React, { useState } from 'react'
import type { Config } from '../interfaces/config';

interface ConfigModalProps {
    onSave?: (newConfig: Config) => void;
    onCancel?: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ onSave, onCancel }) => {
    const [config, setConfig] = useState<Config>({
        apiKey: "Prueba",
        hfModel: "deepseek-ai/DeepSeek-V3.2-Exp:novita"
    });

    const handleChange = (field: keyof Config, value: string) => {
        setConfig((prev) => ({
            ...prev, 
            [field]: value
        }));
    }

    return (
        <div className="Config-Modal">
            <h1>Configuración</h1>

            <div className="ConfigModal-Content">
                <label>AI API KEY:</label>
                <input type="password" value={config.apiKey} onChange={(e) => handleChange("apiKey", e.target.value)}/>
                
                <label>Modelo de Hugging Face:</label>
                <select name="HFModel" value={config.hfModel} onChange={(e) => handleChange("hfModel", e.target.value)}>
                    <option value="meta-llama/Llama-3.1-8B-Instruct:cerebras">Meta-Llama-3.1-8B</option>
                    <option value="deepseek-ai/DeepSeek-V3.2-Exp:novita">Deepseek-V3.2</option>
                </select>
            </div>

            <div className="Modal-Buttons">
                <button className="Cancel-Button" onClick={() => onCancel?.()}>Cancelar</button>
                <button
                    className="Delete-Button"
                    onClick={() => {onSave?.(config)}}>
                    Guardar
                </button>
            </div>
        </div>
    )
}
