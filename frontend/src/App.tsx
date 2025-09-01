import { useState, useRef, useEffect } from 'react';
import { v4 as uuid } from 'uuid'
import type { Message } from './interfaces/message';
import type { Conversation } from './interfaces/conversation';
import { SideMenu } from './components/side_menu';
import { Chat } from './components/chat';
import { DragZone } from './components/drag_zone';
import './styles/styles.scss'
import axios from 'axios';

const App: React.FC = () => {
    const [sideMenu, setSideMenu] = useState(true);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const textBoxRef = useRef<HTMLInputElement>(null);

    // Load conversations from the database on startup
    useEffect(() => {
        const get_conversations = async () => {
            const response = await axios.get('http://localhost:8000/conversations');
            setConversations(response.data);
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
            try {
                const response = await axios.get("http://localhost:8000/messages", {
                    params: { conversation_id: currentConversation.idConversation }
                });

                setMessages(response.data);
            } catch(error) {
                console.error("Error al cargar las conversaciones: ", error);
            }
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

            try {
                const response = await axios.post("http://localhost:8000/assistant", formData);
                const data = response.data
                setMessages(prev => [...prev, data.answer]);

                // If a new chat was created, insert it into the list and set it as the current conversation
                if (data.conversation) {
                    setConversations(prev => [...prev, data.conversation]);
                    setCurrentConversation(data.conversation);
                }
            } catch(error) {
                console.error("Error al enviar el mensaje: ", error);
            }
        }
    }

    const DeleteConversation = async (conversation: Conversation) => {
        try {
            const response = await axios.delete("http://localhost:8000/conversations", { 
                params: { conversation_id: conversation.idConversation }
            });

            if (response.status === 200) {
                setConversations(prev => prev.filter(i => i.idConversation !== conversation.idConversation));
        
                if (currentConversation?.idConversation == conversation.idConversation) {
                    setCurrentConversation(null);
                }
            }
        } catch(error) {
            console.error("Error al eliminar la conversación: ", error);
        }
    }

    const RenameConversation = async (conversation: Conversation, newTitle: string) => {
        try {
            const updated = { ...conversation, title: newTitle };
            const response = await axios.put("http://localhost:8000/conversations", updated);

            if (response.status === 200) {
                setConversations(prev =>
                    prev.map(c => {
                        if (c.idConversation === conversation.idConversation) {
                            c.title = newTitle;
                        }

                        return c;
                    })
                );
            } 
        } catch(error) {
            console.error("Error al renombrar el archivo: ", error);
        }
    }

    const DownloadConversation = async(conversation: Conversation) => {
            try {
                const response = await axios.get("http://localhost:8000/conversations/download", {
                    params: { conversation_id: conversation.idConversation },
                    responseType: "blob"
                });

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("Download", `${conversation.title}.txt`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
            catch(error) {
                console.error("Error descargando archivo: ", error);
            }
        }

    return (
        <main>
            <SideMenu
                isOpen={sideMenu}
                items={conversations}
                selectedItem={currentConversation}
                onSelectedItem={setCurrentConversation}
                onDeleteConversation={(c) => DeleteConversation(c)}
                onRenameConversation={RenameConversation}
                onDownloadConversation={DownloadConversation}
                onToggle={() => setSideMenu(!sideMenu)}/>
            <DragZone onDropFile={setFile} validFiles={["plain"]}>
                <Chat
                    messages={messages}
                    textBoxRef={textBoxRef}
                    attachedFile={file}
                    onSendMessage={handleSendMessage}/>
            </DragZone>
        </main>
    )
}

export default App