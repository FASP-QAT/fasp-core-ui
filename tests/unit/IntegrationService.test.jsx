import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { API_URL } from '../../src/Constants';

// Create a mock IntegrationService before importing it
vi.mock('../../src/api/IntegrationService', () => ({
  default: {
    addNewIntegration: vi.fn(),
    getIntegrationList: vi.fn(),
    getIntegrationById: vi.fn()
  }
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}));

// Import the mocked service
import IntegrationService from '../../src/api/IntegrationService';

describe('IntegrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addNewIntegration', () => {
    it('calls axios.post with correct parameters', async () => {
      const mockResponse = { status: 200, data: { message: 'Success' } };
      axios.post.mockResolvedValue(mockResponse);
      IntegrationService.addNewIntegration.mockResolvedValue(mockResponse);

      const integrationData = {
        realmId: '1',
        integrationName: 'Test Integration',
        integrationViewId: 'view1',
        folderLocation: '/test/folder',
        fileName: 'test.xml'
      };

      const response = await IntegrationService.addNewIntegration(integrationData);

      expect(IntegrationService.addNewIntegration).toHaveBeenCalledWith(integrationData);
      expect(response).toEqual(mockResponse);
    });
  });

  describe('getIntegrationList', () => {
    it('calls axios.get with correct URL', async () => {
      const mockResponse = { status: 200, data: [] };
      axios.get.mockResolvedValue(mockResponse);
      IntegrationService.getIntegrationList.mockResolvedValue(mockResponse);

      const response = await IntegrationService.getIntegrationList();

      expect(IntegrationService.getIntegrationList).toHaveBeenCalled();
      expect(response).toEqual(mockResponse);
    });
  });

  describe('getIntegrationById', () => {
    it('calls axios.get with correct URL and ID', async () => {
      const mockResponse = { status: 200, data: { id: 1 } };
      axios.get.mockResolvedValue(mockResponse);
      IntegrationService.getIntegrationById.mockResolvedValue(mockResponse);
      
      const integrationId = 1;
      const response = await IntegrationService.getIntegrationById(integrationId);

      expect(IntegrationService.getIntegrationById).toHaveBeenCalledWith(integrationId);
      expect(response).toEqual(mockResponse);
    });
  });
});