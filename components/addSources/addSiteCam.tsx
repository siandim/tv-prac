import React, { useEffect, useState } from "react";
import { siteCamp } from "@/libs/types";
import { Button, Link,Spinner } from "@radix-ui/themes";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

interface Props {
  tvId: number;
  tvName: string;
  onNewEntry: () => void;
}

const SiteCamPage: React.FC<Props> = ({ tvId, tvName, onNewEntry }) => {
  const [siteCamp, setSiteCamp] = useState<siteCamp | null>(null);
  const [filePanels, setFilePanels] = useState<{ [key: string]: number[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  // Consolidated state for selected files and their order
  const [selectedFiles, setSelectedFiles] = useState<{ [filename: string]: boolean }>({});

  useEffect(() => {
    const fetchCamSite = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/fetchCamSite");
        const data = await response.json();
        setSiteCamp(data);
      } catch (error) {
        console.error("Failed to fetch site camera data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSourceData = async () => {
      try {
        const response = await fetch(`/api/source/tv/${tvId}`);
        const data = await response.json();
        const panels = data.reduce((acc: { [key: string]: number[] }, source: any) => {
          if (source.tvId === tvId) {
            if (!acc[source.source]) {
              acc[source.source] = [];
            }
            acc[source.source].push(source.panel);
          }
          return acc;
        }, {});
        setFilePanels(panels);
      } catch (error) {
        console.error("Error fetching source data:", error);
      }
    };

    fetchCamSite();
    fetchSourceData();
  }, [tvId]);

  // Consolidated function to handle file selection changes
  const updateSelectedFiles = (files: string[], isSelected: boolean) => {
    setSelectedFiles((prevSelected) => {
      const updatedSelected = { ...prevSelected };
      files.forEach((file) => {
        updatedSelected[file] = isSelected;
      });
      return updatedSelected;
    });
  };

  const handleFileSelect = (filename: string) => {
    updateSelectedFiles([filename], !selectedFiles[filename]);
  };

  const handleSelectAll = () => {
    if (siteCamp) {
      const allFiles = Object.values(siteCamp).map(({ filename }) => filename);
      updateSelectedFiles(allFiles, true);
    }
  };

  const handleDeselectAll = () => {
    if (siteCamp) {
      const allFiles = Object.values(siteCamp).map(({ filename }) => filename);
      updateSelectedFiles(allFiles, false);
    }
  };

  // Helper function to submit files
  const submitFiles = async (panel: number) => {
    const selectedFilenames = Object.keys(selectedFiles).filter((file) => selectedFiles[file]);
    if (!siteCamp || selectedFilenames.length === 0) {
      setMessage("Please select at least one file.");
      return;
    }

    try {
      setSubmitting(true);

      // Fetch current maximum insideIndex for the specific panel and tvId
      const response = await fetch(`/api/source/getMaxInsideIndex?tvId=${tvId}&panel=${panel}`);
      const maxInsideIndexData = await response.json();
      let currentInsideIndex = (maxInsideIndexData.maxInsideIndex || 0) + 1;

      // Submit each file
      for (const filename of selectedFilenames) {
        const fileData = Object.entries(siteCamp).find(
          ([_, value]) => value.filename === filename
        );
        if (!fileData) continue;

        const res = await fetch("/api/source/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fileData[0],
            source: filename,
            panel,
            tvId,
            insideIndex: currentInsideIndex++,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to submit file");
        }
      }

      // Update state after successful submission
      setFilePanels((prevFilePanels) => {
        const updatedPanels = { ...prevFilePanels };
        selectedFilenames.forEach((filename) => {
          if (!updatedPanels[filename]) {
            updatedPanels[filename] = [];
          }
          if (!updatedPanels[filename].includes(panel)) {
            updatedPanels[filename].push(panel);
          }
        });
        return updatedPanels;
      });

      onNewEntry();
      setMessage("Files successfully submitted!");
    } catch (error) {
      console.error("Error submitting files:", error);
      setMessage("Error: Failed to submit files");
    } finally {
      setSubmitting(false);
    }
  };

  const renderFileList = () => {
    if (!siteCamp) return null;

    return (
      <div>
        <div className="mb-3 flex space-x-3">
          <Button onClick={handleSelectAll}>Select All</Button>
          <Button onClick={handleDeselectAll}>Deselect All</Button>
        </div>
        {Object.entries(siteCamp).map(([key, { filename }], index) => (
          <div key={key} className="flex items-center border px-2 py-1">
            <div className="flex items-center flex-grow">
              <input
                type="checkbox"
                checked={!!selectedFiles[filename]}
                onChange={() => handleFileSelect(filename)}
                className="size-5 mr-1"
              />
              <Link href={`https://www.kymesonet.org/json/appSiteCam/${filename}`}>
                {index + 1} {key} Camera - {filename}
              </Link>
            </div>

            {filePanels[filename] !== undefined && (
              <span className="ml-2 text-gray-500">
                Panels: {[...new Set(filePanels[filename])].join(", ")}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Site Camera Data</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>{renderFileList()}</div>
      )}
      <div className="submit-buttons">
        {[1, 2, 3, 4].map((panel) => (
          <div className="mt-2" key={panel}>
            <Button onClick={() => submitFiles(panel)}>
              Submit for Panel {panel}
            </Button>
          </div>
        ))}
      </div>

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

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default SiteCamPage;
