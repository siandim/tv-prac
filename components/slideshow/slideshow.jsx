import React, { useState, useEffect, useMemo } from "react";
import dynamic from 'next/dynamic';
import "react-resizable/css/styles.css";
import Compass from "../compass/compass";

const IframeComponent = dynamic(() => import('./iFrameComponent'), {
  ssr: true
});
const ImageComponent = dynamic(() => import('./imageComponent'), {
  ssr: true
});

const Slideshow = ({ webpages, intervalDuration, getCompassData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [refreshedSources, setRefreshedSources] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Function to update refreshed URLs with timestamp
  const refreshSources = () => {
    const updatedSources = webpages.map((page) => {
      if (page.source.includes("kymesonet.org/json/appSiteCam")) {
        return {
          ...page,
          refreshedSource: `${page.source}?t=${new Date().getTime()}`,
        };
      }
      return {
        ...page,
        refreshedSource: page.source, // No timestamp for other sources
      };
    });
    setRefreshedSources(updatedSources);
  };

  useEffect(() => {
    // Only refresh every 10 minutes for cam sources
    const refreshInterval = setInterval(() => {
      refreshSources();
    }, 600000); // 10 minutes

    // Initial refresh when the component mounts
    refreshSources();

    return () => clearInterval(refreshInterval);
  }, [webpages]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % webpages.length);
        setNextIndex((prevIndex) => (prevIndex + 1) % webpages.length);
        setIsTransitioning(false);
      }, 500); // Match this with the CSS transition duration
    }, intervalDuration * 1000);

    return () => clearInterval(intervalId);
  }, [webpages.length, intervalDuration]);

  const renderContent = useMemo(() => {
    return (page) => {
      if (page.source.includes("kymesonet.org/json/appSiteCam")) {
        return <IframeComponent src={page.refreshedSource} alt={page.name} />;
      } else if (page.source.includes("kymesonet.org/maps/")) {
        return <ImageComponent src={page.refreshedSource} alt={page.name} />;
      } else {
        return <IframeComponent src={page.refreshedSource} alt={page.name} />;
      }
    };
  }, [refreshedSources]);

  const renderSlide = (index, zIndex) => {
    const page = refreshedSources[index];
    if (!page) return null;
    const compassData = getCompassData(page);

    return (
      <div
        className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
          zIndex === 1 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex }}
      >
        <div className="absolute top-0 left-0 bg-black bg-opacity-30 text-white p-2 z-10">
          {page.name}
          {compassData && (
            <div className="text-sm">
              <p>Direction: {compassData.direction} {compassData.angle}°</p>
              <div className="mt-2">
                <Compass direction={compassData.direction} angle={compassData.angle} />
              </div>
            </div>
          )}
        </div>
        {renderContent(page)}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full">
      {renderSlide(currentIndex, 1)}
      {renderSlide(nextIndex, 0)}
    </div>
  );
};

export default Slideshow;

// import React, { useState, useEffect, useCallback } from "react";
// import dynamic from 'next/dynamic';
// import "react-resizable/css/styles.css";
// import Compass from "../compass/compass";

// const IframeComponent = dynamic(() => import('./iFrameComponent'), {
//   ssr: true
// });
// const ImageComponent = dynamic(() => import('./imageComponent'), {
//   ssr: true
// });

// const Slideshow = ({ webpages, intervalDuration, getCompassData }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [refreshedSources, setRefreshedSources] = useState([]);
//   const [preloadedContent, setPreloadedContent] = useState([]);

//   const refreshSources = useCallback(() => {
//     const updatedSources = webpages.map((page) => ({
//       ...page,
//       refreshedSource: page.source && page.source.includes("kymesonet.org/json/appSiteCam")
//         ? `${page.source}?t=${new Date().getTime()}`
//         : page.source,
//     }));
//     setRefreshedSources(updatedSources);
//   }, [webpages]);

//   const renderContent = useCallback((page) => {
//     if (!page || !page.source) {
//       console.error("Invalid page data:", page);
//       return null;
//     }

//     if (page.source.includes("kymesonet.org/json/appSiteCam")) {
//       return <IframeComponent src={page.refreshedSource} alt={page.name} />;
//     } else if (page.source.includes("kymesonet.org/maps/")) {
//       return <ImageComponent src={page.refreshedSource} alt={page.name} />;
//     } else {
//       return <IframeComponent src={page.refreshedSource} alt={page.name} />;
//     }
//   }, []);

//   useEffect(() => {
//     refreshSources();
//     const refreshInterval = setInterval(refreshSources, 600000); // 10 minutes
//     return () => clearInterval(refreshInterval);
//   }, [refreshSources]);

//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       setCurrentIndex((prevIndex) =>
//         prevIndex === refreshedSources.length - 1 ? 0 : prevIndex + 1
//       );
//     }, intervalDuration * 1000);
//     return () => clearInterval(intervalId);
//   }, [refreshedSources.length, intervalDuration]);

//   useEffect(() => {
//     const preloadNextSlides = () => {
//       const nextIndices = [
//         (currentIndex + 1) % refreshedSources.length,
//         (currentIndex + 2) % refreshedSources.length
//       ];
      
//       const newPreloadedContent = nextIndices.map(index => ({
//         index,
//         content: renderContent(refreshedSources[index])
//       }));
      
//       setPreloadedContent(newPreloadedContent);
//     };

//     if (refreshedSources.length > 0) {
//       preloadNextSlides();
//     }
//   }, [currentIndex, refreshedSources, renderContent]);

//   if (refreshedSources.length === 0) {
//     return <div>No content to display</div>;
//   }

//   return (
//     <div className="relative w-full h-full">
//       <div className="relative w-full h-full overflow-hidden">
//         {refreshedSources.map((page, index) => {
//           const compassData = getCompassData(page);
//           const preloadedSlide = preloadedContent.find(item => item.index === index);
//           return (
//             <div
//               key={index}
//               className={
//                 index === currentIndex
//                   ? "block relative w-full h-full"
//                   : "hidden relative w-full h-full"
//               }
//             >
//               <div className="absolute top-0 left-0 bg-black bg-opacity-30 text-white p-2 z-10">
//                 {page.name}
//                 {compassData && (
//                   <div className="text-sm">
//                     <p>Direction: {compassData.direction} {compassData.angle}°</p>
//                     <div className="mt-2">
//                       <Compass direction={compassData.direction} angle={compassData.angle} />
//                     </div>
//                   </div>
//                 )}
//               </div>
//               {preloadedSlide ? preloadedSlide.content : renderContent(page)}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default Slideshow;


// // import React, { useState, useEffect, useMemo } from "react";
// // import dynamic from 'next/dynamic';
// // import "react-resizable/css/styles.css";
// // import Compass from "../compass/compass";
// // // Dynamically import the components with SSR enabled to preload them
// // const IframeComponent = dynamic(() => import('./iFrameComponent'), {
// //   ssr: true
// // });
// // const ImageComponent = dynamic(() => import('./imageComponent'), {
// //   ssr: true
// // });

// // const Slideshow = ({ webpages, intervalDuration, getCompassData }) => {
// //   const [currentIndex, setCurrentIndex] = useState(0);
// //   const [refreshedSources, setRefreshedSources] = useState([]);

// //   // Function to update refreshed URLs with timestamp
// //   const refreshSources = () => {
// //     const updatedSources = webpages.map((page) => {
// //       if (page.source.includes("kymesonet.org/json/appSiteCam")) {
// //         return {
// //           ...page,
// //           refreshedSource: `${page.source}?t=${new Date().getTime()}`,
// //         };
// //       }
// //       return {
// //         ...page,
// //         refreshedSource: page.source, // No timestamp for other sources
// //       };
// //     });
// //     setRefreshedSources(updatedSources);
// //   };

// //   useEffect(() => {
// //     // Only refresh every 10 minutes for cam sources
// //     const refreshInterval = setInterval(() => {
// //       refreshSources();
// //     }, 600000); // 10 minutes

// //     // Initial refresh when the component mounts
// //     refreshSources();

// //     return () => clearInterval(refreshInterval);
// //     // Cleanup on component unmount
// //   }, [webpages]);

// //   useEffect(() => {
// //     const intervalId = setInterval(() => {
// //       setCurrentIndex((prevIndex) =>
// //         prevIndex === webpages.length - 1 ? 0 : prevIndex + 1
// //       );
// //     }, intervalDuration * 1000); // Change slide based on intervalDuration

// //     return () => clearInterval(intervalId); // Cleanup on unmount
// //   }, [webpages.length, intervalDuration]);

// //   // Memoize the rendered content to avoid unnecessary re-renders
// //   const renderContent = useMemo(() => {
// //     return (page) => {
// //       if (page.source.includes("kymesonet.org/json/appSiteCam")) {
// //         return <IframeComponent src={page.refreshedSource} alt={page.name} />;
// //       } else if (page.source.includes("kymesonet.org/maps/")) {
// //         return <ImageComponent src={page.refreshedSource} alt={page.name} />;
// //       } else {
// //         return <IframeComponent src={page.refreshedSource} alt={page.name} />;
// //       }
// //     };
// //   }, [refreshedSources]); // Only recalculate when refreshedSources changes

// //   return (
// //     <div className="relative w-full h-full">
// //       <div className="relative w-full h-full overflow-hidden">
// //         {refreshedSources
// //           .filter((page) => page.source !== null) // Filter out pages with null source paths
// //           .map((page, index) => {
// //             const compassData = getCompassData(page);
// //             return (
// //               // Retrieve compass data for each page

// //               <div
// //                 key={index}
// //                 className={
// //                   index === currentIndex
// //                     ? "block relative w-full h-full"
// //                     : "hidden relative w-full h-full"
// //                 }
// //               >
// //                 <div className="absolute top-0 left-0 bg-black bg-opacity-30 text-white p-2 z-10">
// //                   {page.name}
// //                   {compassData && (
// //                     <div className="text-sm">
// //                       <p>Direction: {compassData.direction} {compassData.angle}°</p>
// //                       <div className="mt-2">
// //                         <Compass direction={compassData.direction} angle={compassData.angle} />
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //                 {renderContent(page)} {/* Render the refreshed content */}
// //               </div>
// //             );
// //           })}
// //       </div>
// //     </div>
// //   );
// // };

// // export default Slideshow;

