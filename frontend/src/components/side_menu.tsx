import React, { useEffect, useState } from 'react'
import type { Conversation } from '../interfaces/conversation'
import type { ContextMenu } from '../interfaces/context_menu'
import { Modal } from './modal'
import { EditableLabel } from './editable_label'
import { ConfigModal } from './config_modal'
import { DeleteModal } from './delete_modal'
import type { Config } from '../interfaces/config'

interface SideMenuProps {
    config: Config,
    isOpen: boolean,
    items: Array<Conversation>,
    selectedItem: Conversation | null,
    onSelectedItem?: (item: Conversation | null) => void,
    onDeleteConversation?: (item: Conversation) => void,
    onRenameConversation?: (item: Conversation, newTitle: string) => void,
    onDownloadConversation?: (item: Conversation) => void,
    onSaveConfig?: (newConfig: Config) => void;
    onToggle?: () => void
}

export const SideMenu: React.FC<SideMenuProps> = ({ 
    config,
    isOpen, 
    items, 
    selectedItem, 
    onSelectedItem, 
    onDeleteConversation, 
    onRenameConversation, 
    onDownloadConversation,
    onSaveConfig,
    onToggle 
}) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [editingConversationId, setEditingConversationId] = useState<string | null>(null);

    const [menu, setMenu] = useState<ContextMenu>({
        visible: false,
        x: 0, y: 0
    })

    useEffect(() => {
        const handleClickOutside = () => setMenu(prev => ({ ...prev, visible: false }));
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    const handleContextMenu = (e: React.MouseEvent<HTMLButtonElement>, conversation: Conversation) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();

        setMenu({
            visible: true,  
            x: rect.x,
            y: rect.y +  rect.height,
            conversation: conversation
        })
    }

    return (
        <div className={`SideMenu-Component ${!isOpen ? "Hidden-Menu" : ""}`}>
            <div className="Menu-Container">
                <div className="Title-Container">
                    <div className="Logo-Container">
                        <img src="ai-logo.svg" className="Isotype" draggable="false" alt="AI Assistant isotipo."/>
                        <img src="ai-assistant.svg" className="Logo" draggable="false" alt="AI Assistant logotipo"/>
                    </div>
                    <button className="Hide-Button" onClick={()=> onToggle?.()}>
                        <img src="Side Menu.svg" draggable="false" alt="Bóton para ocultar menu."/>
                    </button>
                </div>
                <div className="Action-Buttons">
                    <button onClick={() => onSelectedItem?.(null)}>
                        <img src="New.svg" alt="Botón para crear nueva conversación"/>
                        <p>Nueva conversación</p>
                    </button>
                    <hr/>
                </div>
                <ul className="List-Container">
                    {items.map((item) => {
                        const showOptionsButton = menu.visible && menu.conversation?.idConversation == item.idConversation;
                
                        return(
                            <li key={item.idConversation} className={`${selectedItem == item ? "Active" : ""} ${showOptionsButton ? "Hover" : ""}`}>
                                <button onClick={() => {
                                    if (editingConversationId !== item.idConversation) {
                                        onSelectedItem?.(item);
                                    }
                                }}>
                                    <EditableLabel
                                        isEditable={editingConversationId == item.idConversation ? true : false}
                                        onCancel={() => setEditingConversationId(null)}
                                        onTextChanged={(t) => {
                                            onRenameConversation?.(item, t);
                                            setEditingConversationId(null);
                                        }}
                                    >
                                        {item.title}
                                    </EditableLabel>
                                </button>
                                <button className={`Options-Button ${showOptionsButton ? "Visible": "Hidden"}`}
                                        onClick={(e) => { handleContextMenu(e, item) }}>
                                    <img src="options.svg" alt="Boton para desplegar opciones."/>
                                </button>
                            </li>
                        )
                    })}
                </ul>

                <ul className={`Context-Menu ${menu.visible ? "Visible" : "Hidden"}`}
                    style={{top: menu.y, left: menu.x}}
                    onClick={(e) => { e.stopPropagation(); setMenu({visible: false, x: 0, y: 0}) }}>
                    <li><button onClick={() => {
                        if (menu.conversation) {
                            setEditingConversationId(menu.conversation.idConversation);
                        }
                    }}>
                        Renombrar
                    </button></li>
                    
                    <li><button onClick={() => {
                        if (menu.conversation) onDownloadConversation?.(menu.conversation)
                    }}>
                        Descargar
                    </button></li>
                
                    <li><button onClick={() => {
                        setIsModalOpen(true);
                        setModalContent(<DeleteModal 
                            description={`Estas seguro que deseas eliminar la conversación **${menu.conversation?.title}**`}
                            onCancel={() => setIsModalOpen(false)}
                            onDelete={() => {
                                if (menu.conversation) {
                                    onDeleteConversation?.(menu.conversation);
                                    setIsModalOpen(false);
                                }
                            }}
                        />);
                    }}>
                        Eliminar
                    </button></li>
                </ul>

                <button onClick={() => {
                    setIsModalOpen(true);
                    setModalContent(<ConfigModal 
                        key={Date.now()} // Force remount the component for refresh initialValue
                        initialValue={config} 
                        onCancel={() => setIsModalOpen(false)}
                        onSave={(c) => {
                            onSaveConfig?.(c);
                            setIsModalOpen(false);
                        }}
                    />);
                }}>
                    Configuracion
                </button>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(!isModalOpen)}>
                    {modalContent}
                </Modal>
            </div>
        </div>
    )
}
