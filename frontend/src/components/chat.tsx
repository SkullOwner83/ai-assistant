import ReactMarkdown from 'react-markdown';
import type { Message } from '../interfaces/message';
import type { Conversation } from '../interfaces/conversation';

interface ChatProps {
    messages: Array<Message>;
    textBoxRef: React.RefObject<HTMLInputElement | null>;
    attachedFile: File | null;
    currentConversation?: Conversation
    onSendMessage: () => void;
}

export const Chat: React.FC<ChatProps> = ({ messages, textBoxRef, attachedFile, currentConversation, onSendMessage}) => {
    const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && textBoxRef.current?.value.trim() != "") {
            onSendMessage()
        }
    }

    return (
        <div className="Chat-Component">
            <div className="Messages-Container">
                <ul>
                    {messages.map((m, i) => (
                        <li key={i} className={m.messageFrom == "Client" ? "Client-Message" : "Server-Message"}>
                            <div>
                                <ReactMarkdown children={m.content}/>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="TextBox-Container">
                <div className="Input-Wrapper">
                    <img src="clip.png" className={attachedFile? "Visible" : ""} alt="Icono de archivo adjuntado."/>
                    <input 
                        ref={textBoxRef}
                        type="text"
                        placeholder={attachedFile || currentConversation ? "Pregunta sobre el archivo adjunto..." : "Adjunta un archivo para comenzar"}
                        onKeyDown={handleSendMessage}/>
                </div>
            </div>
        </div>
    )
}
