export interface WeatherFile {
  title: string;
  group: string;
  path: string;
  json: string;
  createdAt: string;
  uid: string;
  nanoID: string;
  tags: number[];
}

export interface WeatherData {
  timestamp: string;
  files: WeatherFile[];
}

export interface siteCamp {
  [siteCode: string]: {
    filename: string;
    utctimestamps: string;
  };
}