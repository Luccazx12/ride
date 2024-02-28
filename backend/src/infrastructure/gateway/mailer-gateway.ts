export interface MailerGateway {
  send(subject: string, recipient: string, message: string): Promise<void>;
}

export class ConsoleMailerGateway implements MailerGateway {
  public async send(
    subject: string,
    recipient: string,
    message: string
  ): Promise<void> {
    console.log("Sent!", subject, recipient, message);
  }
}

export class NoopMailerGateway implements MailerGateway {
  public async send(
    _subject: string,
    _recipient: string,
    _message: string
  ): Promise<void> {
    // do nothing
  }
}
