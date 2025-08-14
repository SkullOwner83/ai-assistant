import { useState, useRef } from 'react';
import './styles/styles.scss'

const App = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const textBoxRef = useRef<HTMLInputElement>(null);

    const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (textBoxRef.current) {
                const newMessage = textBoxRef.current.value;
                setMessages(prev => [...prev, newMessage]);
                textBoxRef.current.value = "";

                const response = await fetch('http://localhost:8000/ask', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({'question': newMessage})
                });

                const data = await response.json();
                console.log(data);

                setMessages(prev => [...prev, data.answer]);
            }
        }
    }

    return (
        <main>
            <div className="Main-Container">
                <ul>
                    {messages.map((message, index) => (
                        <li key={index} className="Client-Message">
                            <div>{message}</div>
                        </li>
                    ))}
                </ul>

                <input type="text" placeholder="Pregunta lo que quieras..." ref={textBoxRef} onKeyDown={handleSendMessage}/>
            </div>
        </main>
    )
}

export default App