import { SQSMessage, SQSMessageBody } from '@services/sqs/messages/SQSMessage';

interface CollectionLogItemSQSMessageBody {
  id: number;
  name: string;
  quantity: number;
  obtained: boolean;
};

interface CollectionLogEntrySQSMessageBody extends SQSMessageBody {
  name: string;
  collectionLogId: string;
  items: CollectionLogItemSQSMessageBody[];
  killCounts: string[] | undefined,
};

class CollectionLogEntrySQS implements SQSMessage {
  readonly messageName: string = 'collection-log-entry';
  readonly queueUrl: string = process.env.UPDATE_ENTRY_SQS_URL as string;

  messageBody: CollectionLogEntrySQSMessageBody;

  constructor(messageBody: CollectionLogEntrySQSMessageBody) {
    this.messageBody = messageBody;
  }
}

export {
  CollectionLogEntrySQS,
  CollectionLogEntrySQSMessageBody,
  CollectionLogItemSQSMessageBody,
};
