import AWS from 'aws-sdk';
import { v4 } from 'uuid';

import { SQSMessage, SQSMessageBody } from '@services/sqs/messages';

type SQSServiceResponse = {
  message: string,
  startTime: Date,
  queueUrl: string,
};

class SQSService {
  private sqs: AWS.SQS;

  constructor(options?: AWS.SQS.ClientConfiguration | undefined) {
    this.sqs = new AWS.SQS(options);
  }

  public queueUpdate = (sqsMessage: SQSMessage): SQSServiceResponse => {
    const params = {
      MessageBody: JSON.stringify(sqsMessage.messageBody),
      QueueUrl: sqsMessage.queueUrl,
      MessageGroupId: v4(),
      MessageDeduplicationId: v4(),
    };
    
    const sqsRequest = this.sqs.sendMessage(params, (err, data) => {
      if (err) {
        return console.error({
          statusCode: 500,
          error: err,
        });
      }

      return console.log({
        statusCode: 200,
        message: `${sqsMessage.messageName} ${sqsMessage.messageBody.id} update successfully queued`,
        messageId: data.MessageId,
        sequenceNumber: data.SequenceNumber,
      })
    });

    return {
      message: `Sending ${sqsMessage.messageName} update message`,
      startTime: sqsRequest.startTime,
      queueUrl: sqsMessage.queueUrl,
    };
  }
};

export default SQSService;
