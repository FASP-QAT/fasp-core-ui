import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import userService from '../../src/api/UserService.js';
import { API_URL } from '../../src/Constants.js';

describe('UserService', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });
  
    afterEach(() => {
      vi.clearAllMocks();
    });

    describe('getRoleList', () => {
        it('calls axios.get with the correct URL', async () => {
          const getSpy = vi.spyOn(axios, 'get');
          // Mock authentication
          getSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
          await userService.getRoleList();
          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(getSpy).toHaveBeenCalledWith(`${API_URL}/api/role`, {});
        });
      });

    describe('getBusinessFunctionList', () => {
      it('calls axios.get with the correct URL', async () => {
        const getSpy = vi.spyOn(axios, 'get');
        // Mock authentication and return value
        getSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        await userService.getBusinessFunctionList();
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith(`${API_URL}/api/businessFunction`, {});
      });
    });

    describe('getRealmList', () => {
      it('calls axios.get with the correct URL', async () => {
        const getSpy = vi.spyOn(axios, 'get');
        // Mock authentication and return value
        getSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        await userService.getRealmList();
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith(`${API_URL}/api/realm`, {});
      });
    });

    describe('addNewUser', () => {
      it('calls axios.post with the correct URL and data', async () => {
        const postSpy = vi.spyOn(axios, 'post');
        // Mock authentication and return value
        postSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        const json = { name: 'John Doe', email: 'johndoe@example.com' };
        await userService.addNewUser(json);
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy).toHaveBeenCalledWith(`${API_URL}/api/user`, json, {});
      });
    });

    describe('addNewRole', () => {
      it('calls axios.post with the correct URL and data', async () => {
        const postSpy = vi.spyOn(axios, 'post');
        // Mock authentication and return value
        postSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        const json = { name: 'Admin' };
        await userService.addNewRole(json);
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy).toHaveBeenCalledWith(`${API_URL}/api/role`, json, {});
      });
    });

    describe('getUserList', () => {
      it('calls axios.get with the correct URL', async () => {
        const getSpy = vi.spyOn(axios, 'get');
        // Mock authentication and return value
        getSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        await userService.getUserList();
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith(`${API_URL}/api/user`, {});
      });
    });

    describe('getUserByUserId', () => {
      it('calls axios.get with the correct URL', async () => {
        const getSpy = vi.spyOn(axios, 'get');
        // Mock authentication and return value
        getSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        const userId = 1;
        await userService.getUserByUserId(userId);
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith(`${API_URL}/api/user/${userId}`, {});
      });
    });

    describe('editUser', () => {
      it('calls axios.put with the correct URL and data', async () => {
        const putSpy = vi.spyOn(axios, 'put');
        // Mock authentication and return value
        putSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        const json = { name: 'John Doe', email: 'johndoe@example.com' };
        await userService.editUser(json);
        expect(putSpy).toHaveBeenCalledTimes(1);
        expect(putSpy).toHaveBeenCalledWith(`${API_URL}/api/user`, json, {});
      });
    });

    describe('editRole', () => {
      it('calls axios.put with the correct URL and data', async () => {
        const putSpy = vi.spyOn(axios, 'put');
        // Mock authentication and return value
        putSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        const json = { name: 'Admin' };
        await userService.editRole(json);
        expect(putSpy).toHaveBeenCalledTimes(1);
        expect(putSpy).toHaveBeenCalledWith(`${API_URL}/api/role`, json, {});
      });
    });

    describe('updateExpiredPassword', () => {
      it('calls axios.post with the correct URL and data', async () => {
        const postSpy = vi.spyOn(axios, 'post');
        // Mock authentication and return value
        postSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        const emailId = 'johndoe@example.com';
        const oldPassword = 'oldpassword';
        const newPassword = 'newpassword';
        await userService.updateExpiredPassword(emailId, oldPassword, newPassword);
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy).toHaveBeenCalledWith(`${API_URL}/api/updateExpiredPassword`, { emailId, oldPassword, newPassword }, {});
      });
    });

    describe('changePassword', () => {
      it('calls axios.post with the correct URL and data', async () => {
        const postSpy = vi.spyOn(axios, 'post');
        // Mock authentication and return value
        postSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        const userId = 1;
        const oldPassword = 'oldpassword';
        const newPassword = 'newpassword';
        await userService.changePassword(userId, oldPassword, newPassword);
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy).toHaveBeenCalledWith(`${API_URL}/api/changePassword`, { userId, oldPassword, newPassword }, {});
      });
    });
    describe('forgotPassword', () => {
        it('calls axios.post with the correct URL and data', async () => {
          const postSpy = vi.spyOn(axios, 'post');
          // Mock authentication and return value
          postSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
          const emailId = 'johndoe@example.com';
          await userService.forgotPassword(emailId);
          expect(postSpy).toHaveBeenCalledTimes(1);
          expect(postSpy).toHaveBeenCalledWith(`${API_URL}/api/forgotPassword`, { emailId });
        });
      });

    describe('confirmForgotPasswordToken', () => {
      it('calls axios.post with the correct URL and data', async () => {
        const postSpy = vi.spyOn(axios, 'post');
        // Mock authentication and return value
        postSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        const emailId = 'johndoe@example.com';
        const token = 'token';
        await userService.confirmForgotPasswordToken(emailId, token);
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy).toHaveBeenCalledWith(`${API_URL}/api/confirmForgotPasswordToken`, { emailId, token }, {});
      });
    });

    describe('updatePassword', () => {
      it('calls axios.post with the correct URL and data', async () => {
        const postSpy = vi.spyOn(axios, 'post');
        // Mock authentication and return value
        postSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        const emailId = 'johndoe@example.com';
        const token = 'token';
        const password = 'newpassword';
        await userService.updatePassword(emailId, token, password);
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy).toHaveBeenCalledWith(`${API_URL}/api/updatePassword`, { emailId, token, password }, {});
      });
    });

    describe('getRoleById', () => {
      it('calls axios.get with the correct URL', async () => {
        const getSpy = vi.spyOn(axios, 'get');
        // Mock authentication and return value
        getSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        const json = 1;
        await userService.getRoleById(json);
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith(`${API_URL}/api/role/${json}`, {});
      });
    });

    describe('updateUserLanguage', () => {
      it('calls axios.post with the correct URL and data', async () => {
        const postSpy = vi.spyOn(axios, 'post');
        // Mock authentication and return value
        postSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        const languageCode = 'en-US';
        await userService.updateUserLanguage(languageCode);
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy).toHaveBeenCalledWith(`${API_URL}/api/user/language`, { languageCode }, {});
      });
    });

    describe('acceptUserAgreement', () => {
      it('calls axios.post with the correct URL', async () => {
        const postSpy = vi.spyOn(axios, 'post');
        // Mock authentication and return value
        postSpy.mockImplementation(() => Promise.resolve({ status: 200 }));
        await userService.acceptUserAgreement();
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy).toHaveBeenCalledWith(`${API_URL}/api/user/agreement`, {}, {});
      });
    });
});