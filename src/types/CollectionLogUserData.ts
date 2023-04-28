export enum AccountType {
  NORMAL = 'NORMAL',
  IRONMAN = 'IRONMAN',
  HARDCORE_IRONMAN = 'HARDCORE_IRONMAN',
  ULTIMATE_IRONMAN = 'ULTIMATE_IRONMAN',
  GROUP_IRONMAN = 'GROUP_IRONMAN',
  HARDCORE_GROUP_IRONMAN = 'HARDCORE_GROUP_IRONMAN'
}

export const IRONMAN_TYPES = [
  AccountType.IRONMAN,
  AccountType.HARDCORE_IRONMAN,
  AccountType.ULTIMATE_IRONMAN,
];

export const GROUP_IRONMAN_TYPES = [
  AccountType.GROUP_IRONMAN,
  AccountType.HARDCORE_GROUP_IRONMAN,
];

export interface CollectionLogUserData {
  accountHash?: string;
  accountType: AccountType;
  isFemale: boolean;
  runeliteId?: string;
  username: string;
}
