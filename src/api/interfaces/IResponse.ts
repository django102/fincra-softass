interface IResponse<T = any> {
  status: boolean;
  message?: string;
  code?: number;
  data?: T;
  meta?: Record<string, any>;
  errors?: Record<string, any>;
}

export default IResponse;