import { useState, useRef, useEffect } from 'react';
import { v4 as uuid } from 'uuid'
import type { Message } from './interfaces/message';
import type { Conversation } from './interfaces/conversation';
import './styles/styles.scss'
import { DragZone } from './components/drag_zone';
import { SideMenu } from './components/side_menu';
import { Chat } from './components/chat';

const App: React.FC = () => {
    const [sideMenu, setSideMenu] = useState(true);
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
    const handleSendMessage = async () => {
        if (textBoxRef.current) {
            const content = textBoxRef.current.value
            const formData = new FormData();
            formData.append("question", content)
            if (currentConversation) formData.append("conversation_id", currentConversation.idConversation)
            if (file) formData.append("file", file);

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
                body: formData
            });

            const data = await response.json();
            setMessages(prev => [...prev, data]);
        }
    }

    // Get the dropped file and set it to the state
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }

    // Prevent the default behavior of the browser in the drag event of control
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <main>
            <SideMenu 
                isOpen={sideMenu} 
                items={conversations} 
                selectedItem={currentConversation} 
                onSelectedItem={setCurrentConversation} 
                onToggle={() => setSideMenu(!sideMenu)}/>

            <Chat 
                messages={messages} 
                textBoxRef={textBoxRef}
                attachedFile={file}
                onSendMessage={handleSendMessage} 
                onDrop={handleDrop} 
                onDragOver={handleDragOver}/>
        </main>
    )
}

export default App