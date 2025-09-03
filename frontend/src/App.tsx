import { SideMenu } from './components/side_menu';
import { Chat } from './components/chat';
import { DragZone } from './components/drag_zone';
import { useChat } from './hooks/useChat';
import './styles/styles.scss'

const App: React.FC = () => {
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
        downloadConversation
    } = useChat();

    return (
        <main>
            <SideMenu
                isOpen={sideMenu}
                items={conversations}
                selectedItem={currentConversation}
                onSelectedItem={setCurrentConversation}
                onDeleteConversation={deleteConversation}
                onRenameConversation={renameConversation}
                onDownloadConversation={downloadConversation}
                onToggle={() => setSideMenu(!sideMenu)}/>
            <DragZone onDropFile={setFile} validFiles={["plain"]}>
                <Chat
                    messages={messages}
                    textBoxRef={textBoxRef}
                    attachedFile={file}
                    onSendMessage={sendMessage}/>
            </DragZone>
        </main>
    )
}

export default App