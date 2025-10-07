import React, { useEffect, useState } from 'react'
import type { Config } from '../interfaces/config';

interface ConfigModalProps {
    initialValue: Config;
    onSave?: (newConfig: Config) => void;
    onCancel?: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ initialValue, onSave, onCancel }) => {
    const [config, setConfig] = useState<Config>({ ...initialValue });
    useEffect(() => {
        console.log(config)
    }, [config])

    const handleChange = (field: keyof Config, value: string) => {
        setConfig((prev) => ({
            ...prev, 
            [field]: value
        }));
    }

    useEffect(() => {
        const handleClose = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCancel?.();
            }
        }

        window.addEventListener("keydown", handleClose);
        return () => window.removeEventListener("keydown", handleClose);
    }, [onCancel]);

    return (
        <div className="Config-Modal">
            <h1>Configuración</h1>

            <div className="ConfigModal-Content">
                <label>API KEY:</label>
                <input type="password" value={config.apiKey} onChange={(e) => handleChange("apiKey", e.target.value)}/>

                <label>Provedor de AI:</label>
                <select name="ai_provider" value={config.aiProvider} onChange={(e) => handleChange("aiProvider", e.target.value)}>
                    <option value="open_ai">OpenAI</option>
                    <option value="hugging_face">Huggin Face</option>
                </select>
                
                {config.aiProvider == "open_ai" && (
                    <>
                    <label>Modelo de OpenAI:</label>
                    <select name="OpenAIModel" value={config.openaiModel} onChange={(e) => handleChange("openaiModel", e.target.value)}>
                        <option value="gpt-4o">gpt-4o</option>
                        <option value="gpt-4o-mini">gpt-4o-mini</option>
                        <option value="gpt-4-turbo">gpt-4-turbo</option>
                        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    </select>
                    </>
                )}

                {config.aiProvider == "hugging_face" && (
                    <>
                    <label>Modelo de Hugging Face:</label>
                    <select name="HFModel" value={config.hfModel} onChange={(e) => handleChange("hfModel", e.target.value)}>
                        <option value="meta-llama/Llama-3.1-8B-Instruct:cerebras">Meta-Llama-3.1-8B</option>
                        <option value="deepseek-ai/DeepSeek-V3.2-Exp:novita">Deepseek-V3.2</option>
                    </select>
                    </>
                )}
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