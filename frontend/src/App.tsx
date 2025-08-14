import { useState, useRef } from 'react';
import './styles/styles.scss'

const App = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const textBoxRef = useRef<HTMLInputElement>(null);

    const handleSendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (textBoxRef.current) {
                const newMessage = textBoxRef.current.value;
                setMessages(prev => [...prev, newMessage]);
                textBoxRef.current.value = "";
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