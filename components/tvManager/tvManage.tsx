'use client';

import React, { useState, useEffect } from "react";
import AddUrl from "../addSources/addUrl";
import Selector from "../extraComponents/selector";
import Maps from "../addSources/addMaps";
import SiteCamPage from "../addSources/addSiteCam";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import "./style.css";
import "../styles.css";
import { Button } from "@radix-ui/themes";
import ListOfEntries from "./entries/listOfEntries";

interface idProps {
  id: number;
  name: string;
}

const sourceOptions = [
  { value: "sourceUrl", label: "Input URL" },
  { value: "maps", label: "Maps" },
  { value: "siteCam", label: "Site Camera" },
];

const TvManager: React.FC = () => {
  const [tvName, setTvName] = useState<string>("");
  const [tvs, setTvs] = useState<idProps[]>([]);
  const [selectedTvId, setSelectedTvId] = useState<number | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState<number>(0); 
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    fetchTvs();
  }, []);

  const fetchTvs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tvs/");
      if (!response.ok) {
        throw new Error("Failed to fetch TVs");
      }
      const data: { "TV names": idProps[] } = await response.json();
      setTvs(data["TV names"]);
    } catch (error) {
      console.error("Error fetching TVs:", error);
    }finally{
      setLoading(false);
    }
  };

  const handleAddTv = async () => {
    try {
      const response = await fetch("/api/tvs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: tvName }),
      });
      if (!response.ok) {
        throw new Error("Failed to add TV");
      }

      setTvName("");
      fetchTvs();
    } catch (error) {
      console.error("Error adding TV:", error);
    }
  };

  const handleDeleteTv = async (id: number) => {
    try {
      const response = await fetch("/api/tvs/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete TV");
      }

      fetchTvs();
    } catch (error) {
      console.error("Error deleting TV:", error);
    }
  };

  const handleNewEntry = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const renderSourceComponent = () => {
    if (selectedTvId === null) return null;

  switch (selectedSource) {
  case "maps":
    return (
        <Maps
          tvId={selectedTvId}
          tvName={tvs.find((tv) => tv.id === selectedTvId)?.name || ""}
          onNewEntry={handleNewEntry}
        />
      );
  case "siteCam":
    return (
      <SiteCamPage
        tvId={selectedTvId}
        tvName={tvs.find((tv) => tv.id === selectedTvId)?.name || ""}
        onNewEntry={handleNewEntry}
      />
    );
      case "sourceUrl":
        return (
          <AddUrl
            tvId={selectedTvId}
            tvName={tvs.find((tv) => tv.id === selectedTvId)?.name || ""}
            onNewEntry={handleNewEntry} // Pass the callback
          />
        );
      
      default:
        return null;
    }
  };

  const handleTvSelection = (id: number) => {
    setSelectedTvId(id);
    setSelectedSource(""); // Reset selected source on TV change
  };
  return (
    <div>
      <h1>Add TV</h1>
      <input
        type="text"
        value={tvName}
        onChange={(e) => setTvName(e.target.value)}
        placeholder="TV Name"
        className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500 m-2"
      />
      <button
        onClick={handleAddTv}
      >
        Add TV
      </button>

      <h1 className="mt-4">TV List</h1>
       <p>This is the list of TVs. You can add URLs, maps, or site cameras to the panels.</p>
      {loading ? (
        <p>Loading...</p>
      ) :
      <div className="flex flex-wrap m-2">
       
        {tvs.map((tv) => (
           
          <div key={tv.id} className=" flex space-x-2 w-fit mr-5">
       
            <Button
              onClick={() => setSelectedTvId(tv.id)}
              color="gray"
              className={`${tv.id === selectedTvId? 'Button mauve':'Button'} transition-colors`}
            >
              Manage {tv.name}
            </Button>
            
            <AlertDialog.Root>
              <AlertDialog.Trigger asChild>
                {/* <div className="space-x-3"> */}
                <Button color="red" variant="soft" className="Button">
                  Delete TV
                </Button>
                {/* </div> */}
              </AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="AlertDialogOverlay" />
                <AlertDialog.Content className="AlertDialogContent">
                  <AlertDialog.Title className="AlertDialogTitle">
                    Are you absolutely sure?
                  </AlertDialog.Title>
                  <AlertDialog.Description className="AlertDialogDescription">
                    This action cannot be undone. This will permanently delete
                    the TV and remove its data from our servers.
                  </AlertDialog.Description>
                  <div className="flex gap-4 justify-end">
                    <AlertDialog.Cancel asChild>
                      <Button color="gray"
                      className="Button">
                        Cancel
                      </Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                      <Button
                        color="red"
                        onClick={() => handleDeleteTv(tv.id)}
                        className="Button"
                      >
                        Yes, delete TV
                      </Button>
                    </AlertDialog.Action>
                  </div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
         </div>
          
        ))}
       
      </div>
}
      {selectedTvId !== null && (
        <div className="flex mt-4">
          <div className="w-1/2 p-4">
            <Selector
              label="Sources"
              options={sourceOptions}
              placeholder="Select the Source"
              onChange={(value) => setSelectedSource(value)}
            />
            {renderSourceComponent()}
          </div>
          <div className="w-1/2">
          <ListOfEntries key={`${selectedTvId}-${refreshKey}`} tvId={selectedTvId} />
          </div>
        </div>
      )}
    </div>
    );
};

export default TvManager;
