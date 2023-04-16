interface CollectionLogItemData {
  id: number;
  name: string;
  quantity: number;
  obtained: boolean;
}

interface CollectionLogKillCount {
  amount: number;
  name: string;
}

interface CollectionLogEntryData {
  [entryName: string]: {
    items: CollectionLogItemData[];
    killCounts: string[] | CollectionLogKillCount[];
  };
}

interface CollectionLogTabData {
  [tabName: string]: CollectionLogEntryData;
}

interface CollectionLogData {
  uniqueObtained: number;
  uniqueItems: number;
  totalObtained: number;
  totalItems: number;
  tabs: CollectionLogTabData;
}

export {
  CollectionLogData,
  CollectionLogEntryData,
  CollectionLogItemData,
  CollectionLogTabData,
};
