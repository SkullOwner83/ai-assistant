import React, { useEffect, useState } from 'react'
import type { Conversation } from '../interfaces/conversation'
import type { ContextMenu } from '../interfaces/context_menu'
import { Modal } from './modal'
import axios from 'axios'
import { EditableLabel } from './editable_label'

interface SideMenuProp {
    isOpen: boolean,
    items: Array<Conversation>,
    selectedItem: Conversation | null,
    onSelectedItem?: (item: Conversation | null) => void,
    onDeleteConversation?: (item: Conversation) => void,
    onRenameConversation?: (item: Conversation, newTitle: string) => void,
    onToggle?: () => void
}

export const SideMenu: React.FC<SideMenuProp> = ({ isOpen, items, selectedItem, onSelectedItem, onDeleteConversation, onRenameConversation, onToggle }) => {
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
            <div className="Title-Container">
                <div className="Logo-Container">
                    <img src="ai-logo.svg" className="Isotype" draggable="false" alt="AI Assistant isotipo."/>
                    <img src="ai-assistant.svg" className="Logo" draggable="false" alt="AI Assistant logotipo"/>
                </div>

                <button className="Hide-Button" onClick={()=> onToggle?.()}>
                    <img src="Side Menu.svg" draggable="false" alt="Boton para ocultar menu."/>
                </button>
            </div>

            <div className="Action-Buttons">
                <button onClick={() => onSelectedItem?.(null)}>
                    <img src="New.svg"/>
                    <p>Nueva conversación</p>
                </button>
                <hr/>
            </div>

            <ul className="List-Container">
                {items.map((item) => {
                    const showOptionsButton = menu.visible && menu.conversation?.idConversation == item.idConversation;
                    
                    return(
                        <li key={item.idConversation} className={`${selectedItem == item ? "Active" : ""} ${showOptionsButton ? "Hover" : ""}`}>
                            <button onClick={()=> onSelectedItem?.(item)}>
                                <EditableLabel
                                    isEditable={editingConversationId == item.idConversation ? true : false}
                                    onTextChanged={(t) => onRenameConversation?.(item, t)}>
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
                onClick={(e) => e.stopPropagation()}>
                <li>
                    <button onClick={() => { 
                        setMenu({visible: false, x: 0, y: 0});
                        setEditingConversationId(null);
                        setTimeout(() => setEditingConversationId(menu.conversation!.idConversation), 0);
                    }}>
                        Renombrar
                    </button>
                </li>

                <li><button>Archivar</button></li>
                <li><button>Descargar</button></li>
                <li><button onClick={() => {
                    setIsModalOpen(true);
                    setModalContent(
                        <div className="Delete-Modal">
                            <h1>Confirmar eliminación</h1>
                            <p>Estas seguro que deseas eliminar la conversación <strong>{menu.conversation?.title}</strong></p>
                            
                            <div className="Modal-Buttons">
                                <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button 
                                    className="Delete-Button" 
                                    onClick={() => {
                                        if (menu.conversation) {
                                            onDeleteConversation?.(menu.conversation);
                                            setMenu({visible: false, x: 0, y: 0});
                                            setIsModalOpen(false);
                                        }
                                    }}>
                                    <span>Confirmar</span>
                                </button>
                            </div>
                        </div>
                    )
                }}>
                    Eliminar
                </button></li>
            </ul>

            <Modal isOpen={isModalOpen} onClose={() => {setIsModalOpen(!isModalOpen)}}>
                {modalContent}
            </Modal>
        </div>
    )
}
