import { describe, it, expect, vi, beforeEach } from 'vitest';
import eSignetService from '../../services/eSignetService';

describe('eSignetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('mockSendOTP', () => {
    it('should send OTP successfully in development mode', async () => {
      const nationalId = '1234567890';
      const result = await eSignetService.mockSendOTP(nationalId);

      expect(result.success).toBe(true);
      expect(result.transactionId).toContain('mock_txn_');
      expect(result.maskedMobile).toBe('****1234');
      expect(result.message).toContain('OTP sent successfully');
    });
  });

  describe('mockAuthenticate', () => {
    it('should authenticate successfully with valid OTP', async () => {
      const nationalId = '1234567890';
      const otp = '123456';
      
      const result = await eSignetService.mockAuthenticate(nationalId, otp);

      expect(result.success).toBe(true);
      expect(result.accessToken).toContain('mock_token_');
      expect(result.user.nationalId).toBe(nationalId);
      expect(result.user.role).toBe('field_representative');
    });

    it('should fail authentication with invalid OTP', async () => {
      const nationalId = '1234567890';
      const otp = '999999';
      
      const result = await eSignetService.mockAuthenticate(nationalId, otp);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid OTP');
    });

    it('should return admin user for admin national IDs', async () => {
      const nationalId = 'ADMIN001';
      const otp = '123456';
      
      const result = await eSignetService.mockAuthenticate(nationalId, otp, 'admin');

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('admin');
      expect(result.user.name).toBe('Dr. Sarah Johnson');
    });
  });

  describe('storeAuthData', () => {
    it('should store authentication data in localStorage', () => {
      const authData = {
        success: true,
        accessToken: 'test_token',
        expiresIn: 3600
      };

      eSignetService.storeAuthData(authData);

      const storedData = localStorage.getItem('esignet_auth');
      expect(storedData).toBeTruthy();
      
      const parsedData = JSON.parse(storedData);
      expect(parsedData.accessToken).toBe('test_token');
      expect(parsedData.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe('getStoredAuthData', () => {
    it('should return stored auth data if not expired', () => {
      const authData = {
        success: true,
        accessToken: 'test_token',
        timestamp: Date.now(),
        expiresAt: Date.now() + 3600000 // 1 hour from now
      };

      localStorage.setItem('esignet_auth', JSON.stringify(authData));

      const result = eSignetService.getStoredAuthData();
      expect(result).toEqual(authData);
    });

    it('should return null and clear data if expired', () => {
      const authData = {
        success: true,
        accessToken: 'test_token',
        timestamp: Date.now() - 7200000, // 2 hours ago
        expiresAt: Date.now() - 3600000 // 1 hour ago (expired)
      };

      localStorage.setItem('esignet_auth', JSON.stringify(authData));

      const result = eSignetService.getStoredAuthData();
      expect(result).toBeNull();
      expect(localStorage.getItem('esignet_auth')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when valid auth data exists', () => {
      const authData = {
        success: true,
        accessToken: 'test_token',
        timestamp: Date.now(),
        expiresAt: Date.now() + 3600000
      };

      localStorage.setItem('esignet_auth', JSON.stringify(authData));

      expect(eSignetService.isAuthenticated()).toBe(true);
    });

    it('should return false when no auth data exists', () => {
      expect(eSignetService.isAuthenticated()).toBe(false);
    });
  });

  describe('clearAuthData', () => {
    it('should clear stored authentication data', () => {
      localStorage.setItem('esignet_auth', JSON.stringify({ test: 'data' }));
      
      eSignetService.clearAuthData();
      
      expect(localStorage.getItem('esignet_auth')).toBeNull();
      expect(eSignetService.authData).toBeNull();
    });
  });

  describe('generateMockUser', () => {
    it('should return predefined user for known national IDs', () => {
      const user = eSignetService.generateMockUser('2304715938', 'field_representative');
      
      expect(user.name).toBe('Priya Sharma');
      expect(user.role).toBe('field_representative');
      expect(user.email).toBe('priya.sharma@sehat-saathi.org');
    });

    it('should generate generic user for unknown national IDs', () => {
      const nationalId = '9999999999';
      const user = eSignetService.generateMockUser(nationalId, 'field_representative');
      
      expect(user.nationalId).toBe(nationalId);
      expect(user.name).toBe('User 9999');
      expect(user.role).toBe('field_representative');
      expect(user.email).toBe('user9999@sehat-saathi.org');
    });
  });
});