import ReactMarkdown from 'react-markdown';
import type { Message } from '../interfaces/message';
import type { Conversation } from '../interfaces/conversation';
import { DragZone } from './drag_zone';

interface ChatProps {
    messages: Array<Message>;
    textBoxRef: React.RefObject<HTMLInputElement | null>;
    attachedFile: File | null;
    validFiles: Array<string>;
    currentConversation?: Conversation | null;
    onSendMessage: () => void;
    onFileChanged: (file: File | null) => void;
    onError?: (message: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ messages, textBoxRef, attachedFile, validFiles, currentConversation, onSendMessage, onFileChanged, onError }) => {
    const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && textBoxRef.current?.value.trim() != "") {
            onSendMessage()
        }
    }

    return (
        <div className="Chat-Component">
            <div className="Messages-Container">
                {!currentConversation? (
                    <DragZone onFileChanged={onFileChanged} validFiles={validFiles} onError={onError}/>
                ) : (
                    <ul>
                        {messages.map((m, i) => (
                            <li key={i} className={m.messageFrom == "Client" ? "Client-Message" : "Server-Message"}>
                                <div>
                                    <ReactMarkdown children={m.content}/>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="TextBox-Container">
                <input 
                    ref={textBoxRef}
                    type="text"
                    placeholder={attachedFile || currentConversation ? "Pregunta sobre el archivo adjunto..." : "Adjunta un archivo para comenzar"}
                    onKeyDown={handleSendMessage}/>
            </div>
        </div>
    )
}
