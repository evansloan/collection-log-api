interface CollectionLogItemData {
  id: number;
  name: string;
  quantity: number;
  obtained: boolean;
  sequence: number;
}

interface CollectionLogKillCount {
  amount: number;
  name: string;
  sequence: number;
}

interface CollectionLogEntryData {
  [entryName: string]: {
    items: CollectionLogItemData[];
    killCounts: CollectionLogKillCount[];
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
