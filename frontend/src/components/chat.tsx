import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import type { Message } from '../interfaces/message';
import type { Conversation } from '../interfaces/conversation';
import { DragZone } from './drag_zone';
import { useEffect, useRef, useState } from 'react';

interface ChatProps {
    messages: Array<Message>;
    textBoxRef: React.RefObject<HTMLInputElement | null>;
    attachedFile: File | null;
    validFiles: Array<string>;
    currentConversation?: Conversation | null;
    onSendMessage: () => Promise<void>;
    onFileChanged: (file: File | null) => void;
    onError?: (message: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ messages, textBoxRef, attachedFile, validFiles, currentConversation, onSendMessage, onFileChanged, onError }) => {
    const lastMessageRef = useRef<HTMLLIElement | null>(null);
    const [waitForMessage, setWaitForMesasge] = useState<boolean>(false);

    useEffect(() => {
            lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && textBoxRef.current?.value.trim() != "") {
            if (!waitForMessage) {
                setWaitForMesasge(true);
                await onSendMessage();
                setWaitForMesasge(false)
            }
        }
    }

    return (
        <div className="Chat-Component">
            <div className="Messages-Container">
                {!currentConversation && !waitForMessage ? (
                    <DragZone onFileChanged={onFileChanged} validFiles={validFiles} onError={onError}/>
                ) : (
                    <ul>
                        {messages.map((m, i) => {
                            const isLast = i === messages.length - 1;
                            return (
                                <li
                                    key={i}
                                    ref={isLast ? lastMessageRef : null}
                                    className={m.messageFrom == "Client" ? "Client-Message" : "Server-Message"}
                                >
                                    <div>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>
                                </li>
                            );
                        })}
                        
                        {waitForMessage && (
                            <div className="Loading-Mark">
                                <p>🧠</p>
                                <div/>
                                <div/>
                                <div/>
                            </div>
                        )}
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
