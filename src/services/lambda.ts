import { Lambda } from 'aws-sdk';

export class LambdaService {
  private static readonly SERVICE_NAME: string = process.env.SERVICE_NAME as string;

  private static readonly STAGE_NAME: string = process.env.STAGE_NAME as string;

  private static instance: LambdaService;

  private lambda: Lambda;

  constructor() {
    let options = undefined;
    if (LambdaService.STAGE_NAME == 'local') {
      options = {
        endpoint: 'http://localhost:3002',
      };
    }
    this.lambda = new Lambda(options);
  }

  public static getInstance() {
    if (!LambdaService.instance) {
      LambdaService.instance = new LambdaService();
    }

    return LambdaService.instance;
  }

  public async invoke(lambdaName: string, payload: any) {
    const params = {
      FunctionName: `${LambdaService.SERVICE_NAME}-${LambdaService.STAGE_NAME}-${lambdaName}`,
      InvocationType: 'Event',
      Payload: JSON.stringify(payload),
    };
    await this.lambda.invoke(params).promise();
  }
}