export interface LogEventPayload {
  /**
   * Service or feature context, e.g. 'AuthService'
   */
  context?: string;

  /**
   * Structured metadata for filtering or debugging Where/When/Who/What/Why/How
   */
  metadata?: Record<string, any>;

  /**
   * Raw data or request body or third-party payloads
   */
  data?: Record<string, any>;

  /**
   * Optional error or exception being logged
   */
  cause?: Error | string;

  /**
   * Alert or persistence options
   */
  options?: {
    sendAlert?: boolean;
    saveToDb?: boolean;
  };
}
