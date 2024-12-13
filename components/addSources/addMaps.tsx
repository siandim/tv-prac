import { useState, useEffect } from "react";
import { WeatherData } from "@/libs/types";
import { Button, Link, Select, Spinner, Strong } from "@radix-ui/themes";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

interface Props {
  tvId: number;
  tvName: string;
  onNewEntry: () => void;
}

const Maps: React.FC<Props> = ({ tvId, onNewEntry }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [filePanels, setFilePanels] = useState<{ [key: string]: number[] }>({});
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectionOrder, setSelectionOrder] = useState<string[]>([]); // NEW: State to keep track of the order in which files are selected

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch("/api/fetchMapData/");
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setWeatherData(null);
      }
    };

    const fetchSourceData = async () => {
      try {
        const response = await fetch(`/api/source/tv/${tvId}`);
        const data = await response.json();
        const panels = data.reduce((acc: { [key: string]: number[] }, source: any) => {
          if (!acc[source.source]) {
            acc[source.source] = [];
          }
          acc[source.source].push(source.panel);
          return acc;
        }, {});
        setFilePanels(panels);
      } catch (error) {
        console.error("Error fetching source data:", error);
      }
    };

    fetchWeatherData();
    fetchSourceData();
  }, [tvId]);

  const handleGroupChange = (groupName: string) => {
    setSelectedGroup(groupName);
    setSelectedFiles([]); // Reset selected files when group changes
    setSelectionOrder([]); // NEW: Reset selection order when group changes
  };

  const handleFileSelect = (fileNanoId: string) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.includes(fileNanoId)
        ? prevFiles.filter((nanoID) => nanoID !== fileNanoId)
        : [...prevFiles, fileNanoId]
    );

    // NEW: Update the selection order whenever a file is selected or deselected
    setSelectionOrder((prevOrder) => {
      if (prevOrder.includes(fileNanoId)) {
        // Remove from the order if deselected
        console.log("removed")
        return prevOrder.filter((id) => id !== fileNanoId);
      } else {
        // Add to the end of the order if selected
        console.log(prevOrder);
        return [...prevOrder, fileNanoId];
      }
    });
  };

  const handleSelectAll = () => {
    if (weatherData) {
      const filesInGroup = weatherData.files
        .filter((file) => file.group === selectedGroup)
        .map((file) => file.nanoID);
      setSelectedFiles(filesInGroup);
      setSelectionOrder(filesInGroup); // Set selection order as all files in the group
    }
  };

  const handleDeselectAll = () => {
    setSelectedFiles([]);
    setSelectionOrder([]); // Clear selection order
  };
  const handleSubmit = async (panel: number) => {
    if (!weatherData || submitting) return;
  
    if (selectedFiles.length === 0) {
      setMessage("Please select at least one file.");
      return;
    }
  
    try {
      setSubmitting(true);
  
      // Fetch current maximum insideIndex for the specific panel and tvId
      const response = await fetch(`/api/source/getMaxInsideIndex?tvId=${tvId}&panel=${panel}`);
      const maxInsideIndexData = await response.json();
      let currentInsideIndex = (maxInsideIndexData.maxInsideIndex || 0) + 1;
  
      const responses: Response[] = [];
  
      // Sequentially submit each file in the order of selection
      for (const nanoID of selectionOrder) {
        const file = weatherData.files.find((file) => file.nanoID === nanoID);
        if (!file) continue;
  
        // Submit the file with the new insideIndex
        const result = await fetch("/api/source/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: file.title,
            source: file.nanoID,
            panel,
            tvId,
            insideIndex: currentInsideIndex, // Use the current insideIndex based on selection order
          }),
        });
  
        responses.push(result);
  
        currentInsideIndex++; // Increment insideIndex for the next file after each submission
      }
  
      const success = responses.every((response) => response.ok);
  
      if (success) {
        // Update the local filePanels state
        setFilePanels((prevFilePanels) => {
          const updatedPanels = { ...prevFilePanels };
  
          // Use the selectionOrder array to update filePanels in the correct order
          selectionOrder.forEach((fileNanoId) => {
            if (!updatedPanels[fileNanoId]) {
              updatedPanels[fileNanoId] = [];
            }
            if (!updatedPanels[fileNanoId].includes(panel)) {
              updatedPanels[fileNanoId].push(panel);
            }
          });
  
          return updatedPanels;
        });
  
        setMessage("");
        onNewEntry();
  
        setTimeout(() => {
          setSubmitting(false);
          setMessage("Files successfully submitted!");
          setTimeout(() => {
            setMessage(""); // Clear message after additional 3 seconds
          }, 3000);
        }, 3000);
      } else {
        const errorData = await Promise.all(
          responses.map((response) => response.json())
        );
        setMessage(
          `Error: ${errorData
            .map((data) => data.message || data[0]?.message)
            .join(", ")}`
        );
      }
    } catch (error) {
      console.error("Error submitting files:", error);
      setMessage("Error: Failed to submit files");
    } finally {
      setSubmitting(false); // Ensure submitting state is reset
    }
  };

  const renderSelectOptions = (groupNames: string[]) => {
    return groupNames.map((groupName) => (
      <Select.Item key={groupName} value={groupName}>
        <Strong>{groupName}</Strong>
      </Select.Item>
    ));
  };

  const renderTitlesByGroup = (group: string) => {
    if (!weatherData) return null;

    const filesInGroup = weatherData.files.filter(
      (file) => file.group === group
    );

    return (
      <div>
        <div className="mb-3 flex space-x-3">
          <Button onClick={handleSelectAll}>Select All</Button>
          <Button onClick={handleDeselectAll}>Deselect All</Button>
        </div>
        {filesInGroup.map((file) => (
          <div key={file.nanoID} className="flex items-center border px-2 py-1">
            <div className="flex items-center flex-grow">
              <input
                type="checkbox"
                checked={selectedFiles.includes(file.nanoID)}
                onChange={() => handleFileSelect(file.nanoID)}
                className="size-5 mr-1"
              />
              <Link href={file.path}>{file.title}</Link>
            </div>
            {filePanels[file.nanoID] !== undefined && (
              <span className="ml-2 text-gray-500">
                Panels: {[...new Set(filePanels[file.nanoID])].join(", ")}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="mb-4 font-bold text-xxl">Add Maps </h1>
      {/* Alert Dialog for Saving Spinner */}
      <AlertDialog.Root open={submitting}>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-96">
          <AlertDialog.Title className="font-bold text-xl mb-4">Saving...</AlertDialog.Title>
          <div className="flex justify-center mb-4">
            <Spinner />
          </div>
          <AlertDialog.Description className="text-center">
            Please wait while your files are being saved.
          </AlertDialog.Description>
        </AlertDialog.Content>
      </AlertDialog.Root>

      <Select.Root
        onValueChange={handleGroupChange}
        value={selectedGroup || ""}
      >
        <Select.Trigger placeholder="Choose the groups..." />
        <Select.Content>
          {renderSelectOptions([
            ...new Set(weatherData?.files.map((file) => file.group)),
          ])}
        </Select.Content>
      </Select.Root>

      {selectedGroup && (
        <div>
          <h2 className="mt-4 mb-4 font-bold text-l">Group: {selectedGroup}</h2>
          {renderTitlesByGroup(selectedGroup)}
        </div>
      )}

      <div className="submit-buttons">
        {[1, 2, 3, 4].map((panel) => (
          <div className="mt-2" key={panel}>
            <Button onClick={() => handleSubmit(panel)}>
              Submit for Panel {panel}
            </Button>
          </div>
        ))}
      </div>

      {submitting && <p className="mt-4">Submitting files...</p>}
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default Maps;
