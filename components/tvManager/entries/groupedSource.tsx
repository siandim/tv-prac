import { useState } from "react";
import { closestCenter, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableRow } from "./SortableRow";
import dynamic from "next/dynamic";
import { Button } from "@radix-ui/themes";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

const DndContextWithNoSSR = dynamic(()=>import('@dnd-kit/core').then((mod)=>mod.DndContext), {ssr:false});

export type Entry = {
  id: number;
  name: string;
  source: string;
  panel: string;
  tvId: number;
  insideIndex: number;
};

interface GroupedSourceProps {
  entries: Entry[];
}

const GroupedSource = ({ entries }: GroupedSourceProps) => {
  const [sources, setSources] = useState<Entry[]>(entries);
  const [activeItem, setActiveItem] = useState<Entry | undefined>(undefined);
  const [removedItems, setRemovedItems] = useState<Set<number>>(new Set());
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
  const [isSaving, setIsSaving] = useState(false);

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveItem(sources.find((item) => item.insideIndex === active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeIndex = sources.findIndex((item) => item.insideIndex === active.id);
    const overIndex = sources.findIndex((item) => item.insideIndex === over.id);

    if (activeIndex !== overIndex) {
      setSources((prev) => arrayMove(prev, activeIndex, overIndex).map((item, i) => ({ ...item, insideIndex: i + 1 })));
    }

    setActiveItem(undefined);
  };

  const handleDragCancel = () => {
    setActiveItem(undefined);
  };

  const removeItem = async (id: number) => {
    setRemovedItems((prev) => new Set(prev).add(id));
    const updated = sources
      .filter(item => item.id !== id)
      .map((item, i) => ({ ...item, insideIndex: i + 1 }));
    setSources(updated);
  };

  const saveOrder = async () => {
    setIsSaving(true);
    try {
      //save the updated order
      await Promise.all(sources.map(source => 
        fetch('/api/source', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: source.id,
            insideIndex: source.insideIndex, // Only updating the insideIndex
          }),
        })
      ));
      await Promise.all(Array.from(removedItems).map(id=>
        fetch('/api/source', {
          method:'Delete',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        })
      ));
       
      // alert("Order saved successfully!");
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Error saving order.");
    } 
  };
  
  return (
    <div className="flex flex-col gap-2 ">
      {sources?.length ? (
        <>
        {/* dragging */}
          <DndContextWithNoSSR
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            {/* sorting in order of the inside index */}
            <SortableContext
              items={sources.map(item => item.insideIndex)}
              strategy={verticalListSortingStrategy}
            >
              <div>
              {sources
                .sort((a, b) => a.insideIndex - b.insideIndex)
                .map(item => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    removeItem={removeItem}
                  />
                ))}
                </div>
            </SortableContext>
            <DragOverlay adjustScale style={{ transformOrigin: "0 0 " }}>
              {activeItem ? (
                <SortableRow
                  item={activeItem}
                  removeItem={removeItem}
                  forceDragging={true}
                />
              ) : null}
            </DragOverlay>
          </DndContextWithNoSSR>
          <div>
          
          </div>
        </>
      ) : <p>No items here.</p>}

      {/* saving alerts  */}
      <div>
      <AlertDialog.Root open={isSaving} onOpenChange={setIsSaving}>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-96">
          <AlertDialog.Title className="font-bold text-center text-xl mb-4">Saved</AlertDialog.Title>
          <AlertDialog.Description className="text-center">
            Your files has been reordered.
          </AlertDialog.Description>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setIsSaving(false)}>OK</Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
      {/* buttons for saving*/}
      <Button
            onClick={saveOrder}
            className="px-2 py-1"
            disabled={isSaving}
            style={{ width: 'auto' }}
          >
            {isSaving ? "Saving..." : "Save"}
      </Button>
      </div>
    </div>
  );
};

export default GroupedSource;
