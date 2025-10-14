import type React from "react";
import ReactMarkdown from "react-markdown";

interface DeleteModalProps {
    description?: string;
    onDelete?: () => void;
    onCancel?: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ description, onDelete, onCancel }) => {
    return(
        <div>
            <h1>Confirmar eliminación</h1>
            <p><ReactMarkdown>{description}</ReactMarkdown></p>

            <div className="Modal-Buttons">
                <button className="Cancel-Button" onClick={() => onCancel?.()}>Cancelar</button>
                <button
                    className="Delete-Button"
                    onClick={() => {onDelete?.()}}
                    autoFocus>
                    Confirmar
                </button>
            </div>
        </div>
    )
}