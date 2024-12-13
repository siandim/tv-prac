'use client';
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Slideshow from "@/components/slideshow/slideshow";
import SlideshowSettings from "@/components/slideshow/slideshowSetting";

const Panel = () => {
  const [dataResponse, setDataResponse] = useState([]);
  const [weatherMap, setWeatherMap] = useState({});
  const [siteCampData, setSiteCampData] = useState({});
  const [compass, setCompass]= useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [intervalDuration, setIntervalDuration] = useState(10);
  const [savedIntervalDuration, setSavedIntervalDuration] = useState(10); // New state to handle saved duration
  const searchParams = useSearchParams();
  const router = useRouter();
  const tvId = searchParams.get("tvId");
  const tvName = searchParams.get("tvName");

  useEffect(() => {
    if (tvName) {
      document.title = `TV ${tvName}`;
    }
  }, [tvName]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sourceRes, camRes, weatherRes,compassRes] = await Promise.all([
          fetch("/api/source/").then(res => res.json()),
          fetch('/api/fetchCamSite/').then(res => res.json()),
          fetch("/api/fetchMapData/").then(res => res.json()),
          fetch("/api/fetchCompass/").then(res => res.json())  // Fetch compass data
        ]);

        setDataResponse(sourceRes.sources);
        setSiteCampData(camRes);
        console.log("Compass data:", compassRes); 
        const map = weatherRes.files.reduce((acc, file) => {
          acc[file.nanoID] = file.path;
          return acc;
        }, {});
        setWeatherMap(map);

        const compassMap = Object.keys(compassRes).reduce((acc, key) => {
          acc[key] = {
            direction: compassRes[key].direction,
            angle: compassRes[key].angle,
          };
          return acc;
        }, {});
        
        setCompass(compassMap); 

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    if (tvId) {
      fetchData();
    }

    const intervalId = setInterval(() => {
      fetch("/api/fetchMapData/").then(res => res.json()).then(weatherRes => {
        const map = weatherRes.files.reduce((acc, file) => {
          acc[file.nanoID] = file.path;
          return acc;
        }, {});
        setWeatherMap(map);
      }).catch(error => console.error("Error fetching weather data:", error));
    }, 120000);

    return () => clearInterval(intervalId);
  }, [tvId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        console.log("Escape key pressed");
        router.push('/');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const getSourcePath = (source) => {
    const path = weatherMap[source.source];
    if (path) {
      return path;
    } else {
      const siteCampFile = siteCampData[source.name]?.filename;
      if (siteCampFile) {
        const siteCamUrl = `https://www.kymesonet.org/json/appSiteCam/${siteCampFile}`;
        if (isValidUrl(siteCamUrl)) {
          return siteCamUrl;
        }
      } else if (isValidUrl(source.source)) {
        return source.source;
      }
      return null;
    }
  };
  const getCompassData = (source) => {
    const siteCamFile = siteCampData[source.name]?.filename;
  
    if (siteCamFile) {
      // Remove the .png extension from the filename
      const stationName = siteCamFile.replace(".jpg", "");
      console.log("GetCompassData:", stationName);
  
      // Return compass data if available for the stationName
      return compass[stationName] || null;
    }
  
    return null; // If no siteCampFile, return null
  };

  const validSourcesByPanel = dataResponse
    .filter(source => source.tvId === parseInt(tvId, 10))
    .map(source => ({
      ...source,
      source: getSourcePath(source)
    }))
    .filter(source => isValidUrl(source.source))
    .reduce((acc, source) => {
    
      if (!acc[source.panel]) acc[source.panel] = [];
      acc[source.panel].push(source);
      // Sort the sources within each panel by `insideIndex`
      acc[source.panel].sort((a, b) => a.insideIndex - b.insideIndex);
      return acc;
    }, {});


  const handleIntervalChange = (e) => {
    setIntervalDuration(Number(e.target.value));
  }
  const handleSave = () => {
    setSavedIntervalDuration(intervalDuration); // Save the interval duration when Save is clicked
  }

  return (
    <div>
      <SlideshowSettings
        intervalDuration={intervalDuration}
        onIntervalChange={handleIntervalChange}
        onSave={handleSave}
      />
      <h2 className="m-2">Scroll down for full screen.</h2>
      <div className="relative grid grid-cols-2 grid-rows-2 w-full h-screen">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        ) : (
          [1, 2, 3, 4].map(panel => (
            <div key={panel} className="relative">
              {validSourcesByPanel[panel] && validSourcesByPanel[panel].length > 0 ? (
                <Slideshow webpages={validSourcesByPanel[panel]} intervalDuration={savedIntervalDuration} getCompassData={getCompassData} />
              ) : (
                <p>Panel {panel}: No content available for this panel.</p>
              )}
            </div>
          ))

        )}
      </div>
    </div>
  );
};

export default Panel;
