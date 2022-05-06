import { SQSMessage, SQSMessageBody } from '@services/sqs/messages/SQSMessage';

interface CollectionLogSQSMessageBody extends SQSMessageBody {
  itemCounts: {
    uniqueObtained: number,
    uniqueItems: number,
    totalObtained: number,
    totalItems: number,
  };
};

class CollectionLogSQS implements SQSMessage {
  readonly messageName: string = 'collection-log';
  readonly queueUrl: string = process.env.UPDATE_LOG_SQS_URL as string;

  messageBody: CollectionLogSQSMessageBody;

  constructor(messageBody: CollectionLogSQSMessageBody) {
    this.messageBody = messageBody;
  }
}

export {
  CollectionLogSQS,
  CollectionLogSQSMessageBody,
};
