import { useState, useRef, useEffect } from 'react';
import { v4 as uuid } from 'uuid'
import type { Message } from './interfaces/message';
import './styles/styles.scss'

const App = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const textBoxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const get_messages = async () => {
            const response = await fetch('http://localhost:8000/messages');
            const data = await response.json();
            setMessages(data)
        }

        get_messages()
    }, [])

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
                setMessages(prev => [...prev, data.answer]);
            }
        }
    }

    return (
        <main>
            <div className="Main-Container">
                <ul>
                    {Object.values(messages).map((message, index) => (
                        <li key={index} className={message.messageFrom === "Client" ? "Client-Message" : "Server-Message"}>
                            <div>{message.content}</div>
                        </li>
                    ))}
                </ul>

                <input type="text" placeholder="Pregunta lo que quieras..." ref={textBoxRef} onKeyDown={handleSendMessage}/>
            </div>
        </main>
    )
}

export default App