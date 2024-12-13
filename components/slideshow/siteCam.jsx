'use client';
import { useEffect, useState } from "react";
import Slideshow from "@/components/slideshow/slideshow";
import Link from "next/link";
import { Button } from "@radix-ui/themes";
import Loading from "@/app/loading";
import SlideshowSettings from "@/components/slideshow/slideshowSetting";

const AllSiteCameras = () => {
  const [siteCameras, setSiteCameras] = useState([]);
  const [compassData, setCompassData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showList, setShowList] = useState(true);
  const [intervalDuration, setIntervalDuration] = useState(10);
  const [savedIntervalDuration, setSavedIntervalDuration] = useState(10);

  useEffect(() => {
    const fetchSiteCameras = async () => {
      try {
        const response = await fetch("/api/fetchCamSite/");
        const data = await response.json();

        if (data && typeof data === 'object') {
          const siteCamerasArray = Object.entries(data).map(([name, details]) => ({
            name,
            ...details,
          }));
          setSiteCameras(siteCamerasArray);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        console.error("Error fetching site camera data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCompassData = async () => {
      try {
        const response = await fetch("/api/fetchCompass/"); // Ensure this API endpoint is correct
        const compassRes = await response.json();

        const compassMap = Object.keys(compassRes).reduce((acc, key) => {
          acc[key] = {
            direction: compassRes[key].direction,
            angle: compassRes[key].angle,
          };
          return acc;
        }, {});

        setCompassData(compassMap);
      } catch (error) {
        console.error("Error fetching compass data:", error);
      }
    };

    fetchSiteCameras();
    fetchCompassData(); // Call fetchCompassData

    const intervalId = setInterval(() => {
      fetchSiteCameras();
      fetchCompassData(); // Fetch new compass data every 10 minutes
    }, 600000); // 10 minutes

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, []);

  const getCompassData = (source) => {
    const stationName = source.name; // Use camera name directly if it matches

    // Return compass data if available for the station name
    return compassData[stationName] || null;
  };

  const divideIntoPanels = (data, numPanels) => {
    if (!Array.isArray(data)) return Array.from({ length: numPanels }, () => []);
    const panels = Array.from({ length: numPanels }, () => []);
    data.forEach((item, index) => {
      panels[index % numPanels].push(item);
    });
    return panels;
  };

  const panelsData = divideIntoPanels(siteCameras, 4);

  const handleIntervalChange = (e) => {
    setIntervalDuration(Number(e.target.value));
  };

  const handleSave = () => {
    setSavedIntervalDuration(intervalDuration); // Save the interval duration when Save is clicked
  };

  return (
    <div className="w-full h-screen">
      <title>All Site Cameras</title>
      <div className="flex justify-center">
        <div className="m-2">
          <Button onClick={() => setShowList(!showList)}>
            {showList ? "Show Slideshow" : "Show List"}
          </Button>
        </div>

        <SlideshowSettings
          intervalDuration={intervalDuration}
          onIntervalChange={handleIntervalChange}
          onSave={handleSave}
        />
      </div>
      <div className="flex justify-center my-4">
        <p>This automatically updates in real-time based on changes to the JSON file, displaying all available site cameras.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loading />
        </div>
      ) : (
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
          {panelsData.map((panelData, index) => (
            <div key={index}>
              {showList ? (
                <div className="border h-full p-3">
                  <h2 className="text-xl font-bold mb-3">Panel {index + 1}</h2>
                  <div className="grid grid-cols-3">
                    {panelData.map((item, idx) => (
                      <div key={idx} className="text-xl">
                        <Link href={`https://www.kymesonet.org/json/appSiteCam/${item.name}.jpg`}>
                          {idx + 1}. {item.name}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                panelData.length > 0 ? (
                  <Slideshow
                    webpages={panelData.map(item => ({
                      name: item.name,
                      source: `https://www.kymesonet.org/json/appSiteCam/${item.filename}`
                    }))}
                    intervalDuration={savedIntervalDuration}
                    getCompassData={getCompassData}
                  />
                ) : (
                  <p>No content available for this panel.</p>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllSiteCameras;
