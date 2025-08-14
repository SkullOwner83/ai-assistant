import { useState, useRef, useEffect } from 'react';
import { v4 as uuid } from 'uuid'
import type { Message } from './interfaces/message';
import type { Conversation } from './interfaces/conversation';
import './styles/styles.scss'

const App = () => {
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const textBoxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const get_conversations = async () => {
            const response = await fetch('http://localhost:8000/conversations');
            const data = await response.json();
            setConversations(data);
        }

        get_conversations();
    }, [])

    useEffect(() => {
        if (!currentConversation) {
            setMessages([]);
            return
        }

        const get_messages = async () => {
            const response = await fetch(`http://localhost:8000/messages?conversation_id=${currentConversation.idConversation}`);
            const data = await response.json();
            console.log(data);
            setMessages(data)
        }

        get_messages();
    }, [currentConversation])

    const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (textBoxRef.current) {
                const content = textBoxRef.current.value
                const newMessage = {
                    idMessage: uuid(),
                    messageFrom: "Client",
                    content: content
                };

                setMessages(prev => [...prev, newMessage]);
                textBoxRef.current.value = "";

                const response = await fetch('http://localhost:8000/ask', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({'question': content})
                });

                const data = await response.json();
                console.log(data)
                setMessages(prev => [...prev, data]);
            }
        }
    }

    return (
        <main>
            <div className="Side-Menu">
                <ul>
                    {Object.values(conversations).map((c, i) => (
                        <li key={i}>
                            <button onClick={()=> setCurrentConversation(c)}>{c.title}</button>
                        </li>
                    ))}
                </ul>

                <div className='Action-Buttons'>
                    <button onClick={() => setCurrentConversation(null)}>+</button>
                </div>
            </div>

            <div className="Chat-Container">
                <div className="Messages-Container">
                    <ul>
                        {Object.values(messages).map((m, i) => (
                            <li key={i} className={m.messageFrom === "Client" ? "Client-Message" : "Server-Message"}>
                                <div>{m.content}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="Text-Container">
                    <input type="text" placeholder="Pregunta lo que quieras..." ref={textBoxRef} onKeyDown={handleSendMessage}/>
                </div>
            </div>
        </main>
    )
}

export default App