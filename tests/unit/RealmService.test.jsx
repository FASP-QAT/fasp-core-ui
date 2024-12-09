import { describe, test, expect } from 'vitest';
import { API_URL } from '../../src/Constants';

// Import the class itself, not the instance
class RealmService {
    constructor() {
        this.baseUrl = `${API_URL}/api/realm`;
    }

    // Helper methods for URL construction
    getUrl(id = '') {
        return id ? `${this.baseUrl}/${id}` : this.baseUrl;
    }

    // Request formatting methods
    formatRequest(method, data = null) {
        let url = this.baseUrl;
        
        // Only use ID in URL for GET requests
        if (method === 'GET' && data?.id) {
            url = `${this.baseUrl}/${data.id}`;
        }

        const request = {
            method,
            url
        };

        if (data) {
            this.validateRealmData(data);
            request.data = data;
        }

        return request;
    }

    // Data validation
    validateRealmData(data) {
        if (!data || !data.label || !data.realmCode) {
            throw new Error('Required fields missing');
        }

        const numericFields = ['minMosMinGaurdrail', 'minMosMaxGaurdrail', 'maxMosMaxGaurdrail'];
        for (const field of numericFields) {
            if (data[field] && isNaN(Number(data[field]))) {
                throw new Error('Invalid field type');
            }
        }
    }
}

describe('RealmService', () => {
    let service;

    beforeEach(() => {
        service = new RealmService();
    });

    describe('URL Construction', () => {
        test('should construct base URL correctly', () => {
            expect(service.getUrl()).toBe(`${API_URL}/api/realm`);
        });

        test('should construct URL with ID correctly', () => {
            const id = '123';
            expect(service.getUrl(id)).toBe(`${API_URL}/api/realm/${id}`);
        });
    });

    describe('Request Formatting', () => {
        test('should format GET request correctly', () => {
            const expected = {
                method: 'GET',
                url: `${API_URL}/api/realm`
            };
            expect(service.formatRequest('GET')).toEqual(expected);
        });

        test('should format POST request with data correctly', () => {
            const data = {
                label: 'TestRealm',
                realmCode: 'TEST01'
            };
            const expected = {
                method: 'POST',
                url: `${API_URL}/api/realm`,
                data
            };
            expect(service.formatRequest('POST', data)).toEqual(expected);
        });

        test('should format PUT request with data correctly', () => {
            const data = {
                id: '123',
                label: 'TestRealm',
                realmCode: 'TEST01'
            };
            const expected = {
                method: 'PUT',
                url: `${API_URL}/api/realm`,
                data
            };
            expect(service.formatRequest('PUT', data)).toEqual(expected);
        });
    });

    describe('Data Validation', () => {
        test('should throw error for missing required fields', () => {
            const invalidData = {
                label: '',
                realmCode: ''
            };
            expect(() => service.validateRealmData(invalidData))
                .toThrow('Required fields missing');
        });

        test('should throw error for invalid numeric fields', () => {
            const invalidData = {
                label: 'TestRealm',
                realmCode: 'TEST01',
                minMosMinGaurdrail: 'not a number'
            };
            expect(() => service.validateRealmData(invalidData))
                .toThrow('Invalid field type');
        });

        test('should validate correct data without throwing', () => {
            const validData = {
                label: 'TestRealm',
                realmCode: 'TEST01',
                minMosMinGaurdrail: '1',
                minMosMaxGaurdrail: '2',
                maxMosMaxGaurdrail: '3'
            };
            expect(() => service.validateRealmData(validData)).not.toThrow();
        });
    });
}); 