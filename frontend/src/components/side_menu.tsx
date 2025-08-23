import React, { useEffect, useState } from 'react'
import type { Conversation } from '../interfaces/conversation'
import type { ContextMenu } from '../interfaces/context_menu'
import axios from 'axios'

interface SideMenuProp {
    isOpen: boolean,
    items: Array<Conversation>,
    selectedItem: Conversation | null,
    onSelectedItem: (item: Conversation | null) => void,
    onToggle: () => void
}

export const SideMenu: React.FC<SideMenuProp> = ({ isOpen, items, selectedItem, onSelectedItem, onToggle }) => {
    const [menu, setMenu] = useState<ContextMenu>({
        visible: false,
        x: 0, y: 0
    })

    useEffect(() => {
        const handleClickOutside = () => setMenu(prev => ({ ...prev, visible: false }));
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    const handleContextMenu = (e: React.MouseEvent<HTMLButtonElement>, item_id: string) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();

        setMenu({
            visible: true,  
            x: rect.x,
            y: rect.y +  rect.height,
            idItem: item_id
        })
    }

    const handleDelete = async (conversation_id: string | undefined) => {
        await axios.delete("http://localhost:8000/conversations", { params: { conversation_id: conversation_id }});
        setMenu({visible: false, x: 0, y: 0});
    }

    return (
        <div className={`SideMenu-Component ${!isOpen ? "Hidden-Menu" : ""}`}>
            <div className="Title-Container">
                <div className="Logo-Container">
                    <img src="ai-logo.svg" className="Isotype" draggable="false"/>
                    <img src="ai-assistant.svg" className="Logo" draggable="false"/>
                </div>

                <button className="Hidde-Button" onClick={()=> onToggle()}>
                    <img src="Side Menu.svg"/>
                </button>
            </div>

            <ul className="">
                {items.map((item) => {
                    const showOptionsButton = menu.visible && menu.idItem == item.idConversation;
                    
                    return(
                        <li key={item.idConversation} className={`${selectedItem == item ? "Active" : ""} ${showOptionsButton ? "Hover" : ""}`}>
                            <button onClick={()=> onSelectedItem(item)}>
                                {item.title}
                            </button>

                            <button className={`Options-Button ${showOptionsButton ? "Visible": "Hidden"}`}
                                    onClick={(e) => { handleContextMenu(e, item.idConversation) }}>
                                <img src="options.svg"/>
                            </button>
                        </li>
                    )
                })}
            </ul>

            <div className="Action-Buttons">
                <button onClick={() => onSelectedItem(null)}>+</button>
            </div>

            <ul className={`Context-Menu ${menu.visible ? "Visible" : "Hidden"}`} 
                style={{top: menu.y, left: menu.x}}
                onClick={(e) => e.stopPropagation()}>
                <li><button>Renombrar</button></li>
                <li><button>Archivar</button></li>
                <li><button>Descargar</button></li>
                <li><button onClick={() => handleDelete(menu.idItem)}>Eliminar</button></li>
            </ul>
        </div>
    )
}
