'use client';
import { Link } from "@radix-ui/themes";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import "../components/styles.css"
import AllSiteCameras from "./siteCameraAll/page";
const TvList = dynamic(() => import('./manageTv/listTvs'), { ssr: false });

export default function Home() {
  const [showLists, setShowLists] = useState<boolean>(false);

  return (
    <div className="p-4">
      <title>TV Homepage</title>
      <h1>Welcome</h1>
      <div className="flex space-x-3">
        <button onClick={() => setShowLists(true)}>
          Show the TV Lists
        </button>
        <Link href="./manageTv/">
          <button>
            Manage TV slides
          </button>
        </Link>
      </div>
        {showLists && 
        <Suspense fallback={<p>Loading...</p>}>
        <TvList />
        </Suspense>}
    </div>
  );
}
