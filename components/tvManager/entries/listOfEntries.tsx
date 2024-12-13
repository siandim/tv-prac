'use client';
import { useEffect, useState } from "react";
import GroupedSource from "./groupedSource";
import Selector from "@/components/extraComponents/selector";

export type Entry = {
  id: number;
  name: string;
  source: string;
  panel: string;
  tvId: number;
  insideIndex: number;
};

const ListOfEntries = ({ tvId }: { tvId: number }) => {
  const [sources, setSources] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPanel, setSelectedPanel] = useState<string>("all");
  // Fetch the sources based on tvId
  useEffect(() => {
    const fetchSourcesByTvId = async (tvId: number) => {
      try {
        const response = await fetch(`/api/source/tv/${tvId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch sources");
        }
        const fetchedSources: Entry[] = await response.json();
        setSources(fetchedSources);
      } catch (error) {
        console.error("Error fetching sources:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchSourcesByTvId(tvId);
  }, [tvId]);

  if (error) return <div>Error: {error}</div>;
  if (loading) return <div>Loading...</div>;

  // Grouping sources by panel
  const groupedSources = sources.reduce((acc, entry) => {
    if (!acc[entry.panel]) acc[entry.panel] = [];
    acc[entry.panel].push(entry);
    return acc;
  }, {} as Record<string, Entry[]>);

  const panels = ['1','2','3','4'];
    const panelOptions = [{value:"all", label: "All Panels"}, 
...panels.map((panel)=>({value:panel, label:`Panel ${panel}`})),];
const handlePanelFilter = (value:string)=> {
  setSelectedPanel(value);
};
  return (
    <div>
      <div className="text-center text-sm p-2 ">
        <p>Drag and drop items to rearrange their order, and click the delete button to remove any unwanted items.<br></br> 
        After making changes—whether rearranging or deleting—be sure to click 'Save' to apply and confirm the updates.
        </p>
      </div>
      
     <Selector
       label="Filter by Panel:"
         options={panelOptions}
         placeholder="Select Panel"
         onChange={handlePanelFilter}
       />
      <div className="border px-4 pt-1">
      {panels.map(panel=> (
        <div className={selectedPanel==="all"|| selectedPanel === panel ? "mb-2" : "hidden"} key={panel}>
          <h2 className="text-center text-lg font-bold"> Panel {panel}</h2>
          {groupedSources[panel] && groupedSources[panel].length>0 ? (
            <GroupedSource entries={groupedSources[panel]}/>
          ):(<div className="text-center"> No item here </div>)}
        </div>
      ))}
      </div>
    </div>
  );
};

export default ListOfEntries;
