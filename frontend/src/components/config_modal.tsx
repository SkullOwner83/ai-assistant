import React, { useState } from 'react'
import type { Config } from '../interfaces/config';

interface ConfigModalProps {
    initialValue: Config;
    onSave?: (newConfig: Config) => void;
    onCancel?: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ initialValue, onSave, onCancel }) => {
    const [config, setConfig] = useState<Config>({ ...initialValue });

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
                <div>
                    <label>API KEY:</label>
                    <input type="password" value={config.apiKey} onChange={(e) => handleChange("apiKey", e.target.value)}/>
                </div>

                <div>
                    <label>Provedor de AI:</label>
                    <select name="ai_provider" value={config.aiProvider} onChange={(e) => handleChange("aiProvider", e.target.value)}>
                        <option value="open_ai">OpenAI</option>
                        <option value="hugging_face">Huggin Face</option>
                    </select>
                </div>
                
                {config.aiProvider == "open_ai" && (
                    <div>
                        <label>Modelo de OpenAI:</label>
                        <select name="OpenAIModel" value={config.openaiModel} onChange={(e) => handleChange("openaiModel", e.target.value)}>
                            <option value="gpt-4o">gpt-4o</option>
                            <option value="gpt-4o-mini">gpt-4o-mini</option>
                            <option value="gpt-4-turbo">gpt-4-turbo</option>
                            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                        </select>
                    </div>
                )}

                {config.aiProvider == "hugging_face" && (
                    <div>
                        <label>Modelo de Hugging Face:</label>
                        <select name="HFModel" value={config.hfModel} onChange={(e) => handleChange("hfModel", e.target.value)}>
                            <option value="meta-llama/Llama-3.1-8B-Instruct:cerebras">Meta-Llama-3.1-8B</option>
                            <option value="deepseek-ai/DeepSeek-V3.2-Exp:novita">Deepseek-V3.2</option>
                        </select>
                    </div>
                )}

                <div style={{gridColumn: "auto"}}>
                    <label>Max tokens:</label>
                    <input type="number" value={config.maxTokens} min={0} max={10000} step={100} onChange={(e) => handleChange("maxTokens", e.target.value)}/>
                </div>

                <div style={{gridColumn: "auto"}}>
                    <label>Temperatura:</label>
                    <input type="number" value={config.temperature} min={0} max={1} step={0.1} onChange={(e) => handleChange("temperature", e.target.value)}/>
                </div>
            </div>

            <div className="Modal-Buttons">
                <button className="Cancel-Button" onClick={() => onCancel?.()}>Cancelar</button>
                <button
                    className="Delete-Button"
                    onClick={() => {onSave?.(config)}}
                    autoFocus>
                    Guardar
                </button>
            </div>
        </div>
    )
}