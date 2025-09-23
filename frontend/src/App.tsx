import { SideMenu } from './components/side_menu';
import { Chat } from './components/chat';
import { DragZone } from './components/drag_zone';
import { useChat } from './hooks/useChat';
import './styles/styles.scss'
import { Modal } from './components/modal';
import { useState } from 'react';
import type { Conversation } from './interfaces/conversation';

const App: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string | null>(null);

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
            <DragZone onDropFile={setFile} validFiles={["plain"]} disable={currentConversation ? true : false}>
                <Chat
                    messages={messages}
                    textBoxRef={textBoxRef}
                    attachedFile={file}
                    currentConversation={currentConversation}
                    onSendMessage={sendMessage}/>
            </DragZone>

            <Modal isOpen={isModalOpen} onClose={() => {setIsModalOpen(!isModalOpen)}}>
                <div>
                    <h1>Advertencia</h1>
                    <p>{modalMessage}</p>

                    <div className="Modal-Buttons">
                        <button onClick={() => setIsModalOpen(false)}>Aceptar</button>
                    </div>
                </div>
            </Modal>
        </main>
    )
}

export default App