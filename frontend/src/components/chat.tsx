import ReactMarkdown from 'react-markdown';
import type { Message } from '../interfaces/message';

interface ChatProps {
    messages: Array<Message>;
    textBoxRef: React.RefObject<HTMLInputElement | null>;
    attachedFile: File | null;
    onSendMessage: () => void;
}

export const Chat: React.FC<ChatProps> = ({ messages, textBoxRef, attachedFile, onSendMessage}) => {
    const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") onSendMessage()
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
                    <img src="clip.png" className={attachedFile? "Visible" : ""}/>
                    <input type="text" placeholder="Pregunta lo que quieras..." ref={textBoxRef} onKeyDown={handleSendMessage}/>
                </div>
            </div>
        </div>
    )
}
