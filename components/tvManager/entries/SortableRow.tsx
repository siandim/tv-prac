import { useSortable } from "@dnd-kit/sortable";
import{CSS} from '@dnd-kit/utilities'

import type {Entry} from "./listOfEntries"

type Props = {
    item:Entry,
    removeItem:(id:number) => void,
    forceDragging?:boolean,
}
import React from 'react'

export function SortableRow({item, removeItem,forceDragging = false}:Props) {
    const {
        attributes,
        isDragging,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
      } = useSortable({id: item.insideIndex});
      const parentStyles = {
        transform:CSS.Transform.toString(transform),
        transition: transition|| undefined,
        opacity:isDragging?"0.4":"1",
        lineHeight:"4",
      }
      const draggableStyles = {cursor:isDragging|| forceDragging?"grabbing":"grab",}
    return (
        <article
        className="flex flex-col w-full" ref={setNodeRef}
        style={parentStyles}
        >
            <div className="text-xs w-full h-fit rounded md flex items-center overflow-hidden border">
                <div className="bg-ring w-12  flex items-center">
                    <p className="w-full text-center  text-xs text-secondary">
                        {item.insideIndex})
                    </p>
                </div>
                <div
                ref={setActivatorNodeRef}
                className="flex-grow"
                style={draggableStyles}
                {...attributes}{...listeners}
                >
                    <h2 >
                        {item.name}
                    </h2>
                </div>
                <div className="w-fit p-0 flex items-center">
                    <button
                    type="button"
                    className="bg-red-200 h-fit"
                    onClick={()=>removeItem(item.id)
                    }>
                        <p className="text-xs"> Delete</p>
                    </button>
                </div>
            </div>
        </article>
    ) 

}