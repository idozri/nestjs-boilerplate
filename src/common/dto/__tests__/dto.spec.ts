import { APIResponseDto } from '../api.response.dto';
import { ErrorResponseDto } from '../error.response.dto';
import { PaginatedApiResponseDto } from '../paginated.api.response.dto';

describe('DTO Classes', () => {
  describe('APIResponseDto', () => {
    it('should create an instance with all properties', () => {
      const response = new APIResponseDto<string>();
      response.isSuccess = true;
      response.message = 'Success message';
      response.data = 'Test data';

      expect(response).toBeDefined();
      expect(response.isSuccess).toBe(true);
      expect(response.message).toBe('Success message');
      expect(response.data).toBe('Test data');
    });

    it('should create an instance without optional data', () => {
      const response = new APIResponseDto<string>();
      response.isSuccess = true;
      response.message = 'Success message';

      expect(response).toBeDefined();
      expect(response.isSuccess).toBe(true);
      expect(response.message).toBe('Success message');
      expect(response.data).toBeUndefined();
    });
  });

  describe('ErrorResponseDto', () => {
    it('should create an instance with all properties', () => {
      const error = new ErrorResponseDto();
      error.isSuccess = false;
      error.message = 'Error message';
      error.errorCode = 'E123';
      error.details = { field: 'name', problem: 'required' };

      expect(error).toBeDefined();
      expect(error.isSuccess).toBe(false);
      expect(error.message).toBe('Error message');
      expect(error.errorCode).toBe('E123');
      expect(error.details).toEqual({ field: 'name', problem: 'required' });
    });

    it('should create an instance without optional properties', () => {
      const error = new ErrorResponseDto();
      error.isSuccess = false;
      error.message = 'Error message';

      expect(error).toBeDefined();
      expect(error.isSuccess).toBe(false);
      expect(error.message).toBe('Error message');
      expect(error.errorCode).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('PaginatedApiResponseDto', () => {
    it('should create an instance with all properties', () => {
      const response = new PaginatedApiResponseDto<string>();
      response.isSuccess = true;
      response.message = 'Success message';
      response.data = ['item1', 'item2'];
      response.total = 10;
      response.page = 1;
      response.pageSize = 2;

      expect(response).toBeDefined();
      expect(response.isSuccess).toBe(true);
      expect(response.message).toBe('Success message');
      expect(response.data).toEqual(['item1', 'item2']);
      expect(response.total).toBe(10);
      expect(response.page).toBe(1);
      expect(response.pageSize).toBe(2);
    });

    it('should extend APIResponseDto correctly', () => {
      const response = new PaginatedApiResponseDto<number>();

      expect(response).toBeInstanceOf(APIResponseDto);
    });
  });
});
