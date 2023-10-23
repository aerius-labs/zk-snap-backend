import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor() {}

  async onModuleInit(): Promise<void> {
    this.connection = await amqp.connect('amqp://127.0.0.1');
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue('voteQueue');
  }

  async isQueueEmpty(queueName: string): Promise<boolean> {
    const queueInfo = await this.channel.checkQueue(queueName);
    return queueInfo.messageCount === 0;
  }

  async sendToQueue(data: any): Promise<void> {
    this.channel.sendToQueue('voteQueue', Buffer.from(JSON.stringify(data)));
  }

  async consumeLatestMessage(queueName: string): Promise<string | null> {
    const message = await this.channel.get(queueName, { noAck: true });
    if (message) {
      return message.content.toString();
    } else {
      return null;
    }
  }
}
