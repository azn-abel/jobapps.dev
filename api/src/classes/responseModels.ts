export class JSONSuccess {
  success = true;
  msg: string;
  data?: Record<string, any>;

  constructor(msg: string, data?: Record<string, any>) {
    this.msg = msg;
    this.data = data;
  }
}

export class JSONFail {
  success = false;
  detail: string;

  constructor(detail: string) {
    this.detail = detail;
  }
}
