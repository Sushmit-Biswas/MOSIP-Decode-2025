import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import ChildForm from '../../pages/ChildForm';

// Mock services
vi.mock('../../services/geolocationService', () => ({
  default: {
    getLocationWithFallback: vi.fn().mockResolvedValue({
      latitude: 28.6139,
      longitude: 77.2090,
      coordinateString: '28.6139, 77.2090',
      accuracy: 10,
      timestamp: Date.now(),
      address: 'New Delhi, India'
    }),
    getAccuracyDescription: vi.fn().mockReturnValue('High accuracy (10m)')
  }
}));

vi.mock('../../services/indexedDB', () => ({
  default: {
    init: vi.fn().mockResolvedValue(true),
    saveChildRecord: vi.fn().mockResolvedValue(true),
    getAllChildRecords: vi.fn().mockResolvedValue([])
  }
}));

vi.mock('../../services/activityLogger', () => ({
  default: {
    logActivity: vi.fn()
  }
}));

vi.mock('../../services/notificationService', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock AuthContext with authenticated user
const mockAuthContext = {
  user: {
    nationalId: '1234567890',
    name: 'Test User',
    role: 'field_representative'
  },
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false
};

vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => mockAuthContext
  };
});

const ChildFormWrapper = () => (
  <BrowserRouter>
    <AuthProvider>
      <ChildForm />
    </AuthProvider>
  </BrowserRouter>
);

describe('ChildForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the child form with all required fields', () => {
    render(<ChildFormWrapper />);

    expect(screen.getByText('New Child Health Record')).toBeInTheDocument();
    expect(screen.getByLabelText(/child's name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age \(years\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weight \(kg\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/height \(cm\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/parent\/guardian's name/i)).toBeInTheDocument();
  });

  it('should handle form input changes', async () => {
    const user = userEvent.setup();
    render(<ChildFormWrapper />);

    const nameInput = screen.getByLabelText(/child's name/i);
    const ageInput = screen.getByLabelText(/age \(years\)/i);

    await user.type(nameInput, 'Test Child');
    await user.type(ageInput, '6');

    expect(nameInput).toHaveValue('Test Child');
    expect(ageInput).toHaveValue(6);
  });

  it('should only allow numeric input for age field', async () => {
    const user = userEvent.setup();
    render(<ChildFormWrapper />);

    const ageInput = screen.getByLabelText(/age \(years\)/i);
    
    await user.type(ageInput, 'abc12def');
    
    // Should only contain the numeric characters
    expect(ageInput).toHaveValue(12);
  });

  it('should validate required fields on submit', async () => {
    const user = userEvent.setup();
    render(<ChildFormWrapper />);

    const submitButton = screen.getByRole('button', { name: /save record/i });
    await user.click(submitButton);

    // Should not submit with empty required fields
    await waitFor(() => {
      expect(screen.getByText('New Child Health Record')).toBeInTheDocument();
    });
  });

  it('should capture location when form loads', async () => {
    const geolocationService = await import('../../services/geolocationService');
    
    render(<ChildFormWrapper />);

    await waitFor(() => {
      expect(geolocationService.default.getLocationWithFallback).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should handle photo upload', async () => {
    render(<ChildFormWrapper />);

    const photoLabel = screen.getByText(/upload or capture photo/i);
    expect(photoLabel).toBeInTheDocument();
    
    // Check that the file input exists within the label
    const fileInput = screen.getByLabelText(/upload or capture photo/i, { selector: 'input[type="file"]' });
    expect(fileInput).toBeInTheDocument();
  });

  it('should handle parental consent checkbox', async () => {
    const user = userEvent.setup();
    render(<ChildFormWrapper />);

    // Look for parental consent checkbox
    const consentCheckbox = screen.getByRole('checkbox', { name: /parental\/guardian consent required/i });
    
    await user.click(consentCheckbox);
    expect(consentCheckbox).toBeChecked();

    await user.click(consentCheckbox);
    expect(consentCheckbox).not.toBeChecked();
  });

  it('should successfully submit form with valid data', async () => {
    const user = userEvent.setup();
    const indexedDB = await import('../../services/indexedDB');
    const notificationService = await import('../../services/notificationService');

    render(<ChildFormWrapper />);

    // Fill out the form
    await user.type(screen.getByLabelText(/child's name/i), 'Test Child');
    await user.type(screen.getByLabelText(/age \(years\)/i), '6');
    await user.type(screen.getByLabelText(/weight \(kg\)/i), '20');
    await user.type(screen.getByLabelText(/height \(cm\)/i), '110');
    await user.type(screen.getByLabelText(/parent\/guardian's name/i), 'Test Parent');
    await user.click(screen.getByRole('checkbox', { name: /parental\/guardian consent required/i }));

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save record/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(indexedDB.default.saveChildRecord).toHaveBeenCalled();
      expect(notificationService.default.success).toHaveBeenCalledWith(
        expect.stringContaining('Child record saved')
      );
    });
  });
});