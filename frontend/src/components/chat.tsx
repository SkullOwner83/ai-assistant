import React from 'react'
import type { Message } from '../interfaces/message';

interface ChatProps {
    messages: Array<Message>;
    textBoxRef: React.RefObject<HTMLInputElement | null>;
    attachedFile: File | null;
    onSendMessage: () => void;
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
}

export const Chat: React.FC<ChatProps> = ({ messages, textBoxRef, attachedFile, onSendMessage, onDrop, onDragOver }) => {
    const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") onSendMessage()
    }

    return (
        <div className="Chat-Component">
            <div className="Messages-Container" onDrop={onDrop} onDragOver={onDragOver}>
                <ul>
                    {Object.values(messages).map((m, i) => (
                        <li key={i} className={m.messageFrom === "Client" ? "Client-Message" : "Server-Message"}>
                            <div>{m.content}</div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="Text-Container">
                <div className="Input-Wrapper">
                    <img src="clip.png" className={attachedFile? "Visible" : ""}/>
                    <input type="text" placeholder="Pregunta lo que quieras..." ref={textBoxRef} onKeyDown={handleSendMessage}/>
                </div>
            </div>
        </div>
    )
}
