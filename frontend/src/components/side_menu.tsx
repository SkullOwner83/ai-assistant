import React, { useEffect, useState } from 'react'
import type { Conversation } from '../interfaces/conversation'
import type { ContextMenu } from '../interfaces/context_menu'
import { Modal } from './modal'
import axios from 'axios'

interface SideMenuProp {
    isOpen: boolean,
    items: Array<Conversation>,
    selectedItem: Conversation | null,
    onSelectedItem?: (item: Conversation | null) => void,
    onRemoveConversation?: (item: Conversation) => void
    onToggle?: () => void
}

export const SideMenu: React.FC<SideMenuProp> = ({ isOpen, items, selectedItem, onSelectedItem, onRemoveConversation, onToggle }) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

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

    const handleDelete = async (conversation: Conversation) => {
        const response = await axios.delete("http://localhost:8000/conversations", { params: { conversation_id: conversation.idConversation }});
        if (response.status === 200) onRemoveConversation?.(conversation);
        setMenu({visible: false, x: 0, y: 0});
        setIsModalOpen(false);
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
                                {item.title}
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
                <li><button>Renombrar</button></li>
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
                                <button onClick={() => {if (menu.conversation) handleDelete(menu.conversation)}}>Confirmar</button>
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
