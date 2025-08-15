import { useState, useRef, useEffect } from 'react';
import { v4 as uuid } from 'uuid'
import type { Message } from './interfaces/message';
import type { Conversation } from './interfaces/conversation';
import './styles/styles.scss'

const App = () => {
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const textBoxRef = useRef<HTMLInputElement>(null);

    // Load conversations from the database
    useEffect(() => {
        const get_conversations = async () => {
            const response = await fetch('http://localhost:8000/conversations');
            const data = await response.json();
            setConversations(data);
        }

        get_conversations();
    }, [])

    // Update the corresponding messages when the conversation is changed
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

    // Send the message and wait for the reponse to the server
    const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (textBoxRef.current) {
                const content = textBoxRef.current.value
                const dataForm = new FormData();
                dataForm.append("question", content)
                if (currentConversation) dataForm.append("conversation_id", currentConversation.idConversation)
                if (file) dataForm.append("file", file);

                const newMessage = {
                    idMessage: uuid(),
                    messageFrom: "Client",
                    content: content
                };

                setMessages(prev => [...prev, newMessage]);
                textBoxRef.current.value = "";
                setFile(null)

                const response = await fetch('http://localhost:8000/ask', {
                    method: 'POST',
                    body: dataForm
                });

                const data = await response.json();
                setMessages(prev => [...prev, data]);
            }
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

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
                <div className="Messages-Container" onDrop={handleDrop} onDragOver={handleDragOver}>
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
                        <img src="clip.png" className={file? "Visible" : ""}/>
                        <input type="text" placeholder="Pregunta lo que quieras..." ref={textBoxRef} onKeyDown={handleSendMessage}/>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default App