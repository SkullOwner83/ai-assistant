import { SideMenu } from './components/side_menu';
import { Chat } from './components/chat';
import { useChat } from './hooks/useChat';
import './styles/styles.scss'
import { Modal } from './components/modal';
import { useState } from 'react';
import type { Conversation } from './interfaces/conversation';

const App: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const VALID_FILES = ["txt", "pdf", "docx"]

    const {
        sideMenu,
        setSideMenu,
        currentConversation,
        setCurrentConversation,
        conversations,
        messages,
        file,
        setFile,
        textBoxRef,
        sendMessage,
        deleteConversation,
        renameConversation,
        downloadConversation,
    } = useChat({onError: (msg) =>{
        setModalMessage(msg)
        setIsModalOpen(true);
    }});

    const onSelectedItem = (conversation: Conversation | null) => {
        if (textBoxRef.current) textBoxRef.current.value = "";
        setCurrentConversation(conversation);
        setFile(null);
    }

    const showError = (message: string) => {
        setModalMessage(message)
        setIsModalOpen(true);
    }

    return (
        <main>
            <SideMenu
                isOpen={sideMenu}
                items={conversations}
                selectedItem={currentConversation}
                onSelectedItem={(c) => onSelectedItem(c)}
                onDeleteConversation={deleteConversation}
                onRenameConversation={renameConversation}
                onDownloadConversation={downloadConversation}
                onToggle={() => setSideMenu(!sideMenu)}/>

            <Chat
                messages={messages}
                textBoxRef={textBoxRef}
                attachedFile={file}
                validFiles={VALID_FILES}
                currentConversation={currentConversation}
                onSendMessage={sendMessage}
                onFileChanged={setFile}
                onError={showError}/>

            <Modal isOpen={isModalOpen} onClose={() => {setIsModalOpen(!isModalOpen)}}>
                <div>
                    <h1>Advertencia</h1>
                    <p>{modalMessage}</p>

                    <div className="Modal-Buttons">
                        <button 
                            children="Aceptar"
                            onClick={() => { 
                                setIsModalOpen(false)
                                setModalMessage("")
                            }
                        }/>
                    </div>
                </div>
            </Modal>
        </main>
    )
}

export default App