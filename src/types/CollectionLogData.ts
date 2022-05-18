interface CollectionLogItemData {
  id: number;
  name: string;
  quantity: number;
  obtained: boolean;
};

interface CollectionLogEntryData {
  [entryName: string]: {
    items: CollectionLogItemData[],
    kill_count: string[] | undefined,
  }
};

interface CollectionLogTabData {
  [tabName: string]: CollectionLogEntryData
};

interface CollectionLogData {
  unique_obtained: number;
  unique_items: number;
  total_obtained: number;
  total_items: number;
  tabs: CollectionLogTabData,
};

export {
  CollectionLogData,
  CollectionLogEntryData,
  CollectionLogItemData,
  CollectionLogTabData,
};
