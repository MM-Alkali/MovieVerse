declare module 'nodemailer-sendinblue-transport' {
    import * as nodemailer from 'nodemailer';
  
    interface SendinBlueOptions {
      apiKey: string | any;
      timeout?: number;
      apiUrl?: string;
      version?: string;
    }
  
    function sendinBlue(options: SendinBlueOptions): nodemailer.Transport;
  
    export = sendinBlue;
  }
  