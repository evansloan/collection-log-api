import { CollectionLogSQSMessageBody, CollectionLogEntrySQSMessageBody } from '@services/sqs/messages';

export interface SQSMessageBody {
  id: string;
};

export interface SQSMessage {
  readonly messageName: string;
  readonly queueUrl: string;
  messageBody: SQSMessageBody;
}
