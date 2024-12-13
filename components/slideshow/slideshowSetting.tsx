import { Button } from "@radix-ui/themes";
import React from "react";

interface SlideshowSettingsProps {
  intervalDuration: number;
  onIntervalChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}
//sets the Slide durations
const SlideshowSettings: React.FC<SlideshowSettingsProps> = ({ intervalDuration, onIntervalChange, onSave }) => {
  return (
    <div className="ml-2 p-2 border border-gray-300 rounded w-fit">
      <label className="mr-2">
        Slide Duration (seconds):
        <input
          type="number"
          value={intervalDuration}
          onChange={onIntervalChange}
          className="w-fit ml-2 p-1 border border-gray-300 rounded"
        />
      </label>
      <Button onClick={onSave} className="ml-2 p-1 border border-gray-300 rounded">
        Save
      </Button>
    </div>
  );
};

export default SlideshowSettings;
