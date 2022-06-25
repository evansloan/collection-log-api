export enum AccountType {
  NORMAL = 'NORMAL',
  IRONMAN = 'IRONMAN',
  HARDCORE_IRONMAN = 'HARDCORE_IRONMAN',
  ULTIMATE_IRONMAN = 'ULTIMATE_IRONMAN',
  GROUP_IRONMAN = 'GROUP_IRONMAN',
  HARDCORE_GROUP_IRONMAN = 'HARDCORE_GROUP_IRONMAN'
}

interface CollectionLogUserData {
  accountHash?: string;
  accountType: AccountType;
  isFemale: boolean;
  runeliteId?: string;
  username: string;
}

export { CollectionLogUserData };