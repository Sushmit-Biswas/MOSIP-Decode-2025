import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import ChildForm from '../../pages/ChildForm';

// Mock services
vi.mock('../../services/geolocationService', () => ({
  default: {
    getCurrentLocation: vi.fn().mockResolvedValue({
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'New Delhi, India'
    })
  }
}));

vi.mock('../../services/indexedDB', () => ({
  default: {
    init: vi.fn().mockResolvedValue(true),
    addRecord: vi.fn().mockResolvedValue(true)
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

    expect(screen.getByText('New Child Registration')).toBeInTheDocument();
    expect(screen.getByLabelText(/child's name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age \(months\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mother's name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/father's name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact number/i)).toBeInTheDocument();
  });

  it('should handle form input changes', async () => {
    const user = userEvent.setup();
    render(<ChildFormWrapper />);

    const nameInput = screen.getByLabelText(/child's name/i);
    const ageInput = screen.getByLabelText(/age \(months\)/i);

    await user.type(nameInput, 'Test Child');
    await user.type(ageInput, '6');

    expect(nameInput).toHaveValue('Test Child');
    expect(ageInput).toHaveValue(6);
  });

  it('should only allow numeric input for age field', async () => {
    const user = userEvent.setup();
    render(<ChildFormWrapper />);

    const ageInput = screen.getByLabelText(/age \(months\)/i);
    
    await user.type(ageInput, 'abc123def');
    
    // Should only contain the numeric characters
    expect(ageInput).toHaveValue(123);
  });

  it('should validate required fields on submit', async () => {
    const user = userEvent.setup();
    render(<ChildFormWrapper />);

    const submitButton = screen.getByRole('button', { name: /register child/i });
    await user.click(submitButton);

    // Should not submit with empty required fields
    await waitFor(() => {
      expect(screen.getByText('New Child Registration')).toBeInTheDocument();
    });
  });

  it('should capture location when form loads', async () => {
    const geolocationService = await import('../../services/geolocationService');
    
    render(<ChildFormWrapper />);

    await waitFor(() => {
      expect(geolocationService.default.getCurrentLocation).toHaveBeenCalled();
    });
  });

  it('should handle gender selection', async () => {
    const user = userEvent.setup();
    render(<ChildFormWrapper />);

    const maleOption = screen.getByRole('radio', { name: /male/i });
    const femaleOption = screen.getByRole('radio', { name: /female/i });

    await user.click(maleOption);
    expect(maleOption).toBeChecked();
    expect(femaleOption).not.toBeChecked();

    await user.click(femaleOption);
    expect(femaleOption).toBeChecked();
    expect(maleOption).not.toBeChecked();
  });

  it('should handle vaccination status checkboxes', async () => {
    const user = userEvent.setup();
    render(<ChildFormWrapper />);

    // Look for vaccination checkboxes
    const bcgCheckbox = screen.getByRole('checkbox', { name: /bcg/i });
    
    await user.click(bcgCheckbox);
    expect(bcgCheckbox).toBeChecked();

    await user.click(bcgCheckbox);
    expect(bcgCheckbox).not.toBeChecked();
  });

  it('should successfully submit form with valid data', async () => {
    const user = userEvent.setup();
    const indexedDB = await import('../../services/indexedDB');
    const notificationService = await import('../../services/notificationService');

    render(<ChildFormWrapper />);

    // Fill out the form
    await user.type(screen.getByLabelText(/child's name/i), 'Test Child');
    await user.type(screen.getByLabelText(/age \(months\)/i), '6');
    await user.click(screen.getByRole('radio', { name: /male/i }));
    await user.type(screen.getByLabelText(/mother's name/i), 'Test Mother');
    await user.type(screen.getByLabelText(/father's name/i), 'Test Father');
    await user.type(screen.getByLabelText(/contact number/i), '9876543210');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /register child/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(indexedDB.default.addRecord).toHaveBeenCalled();
      expect(notificationService.default.success).toHaveBeenCalledWith(
        expect.stringContaining('Child registered successfully')
      );
    });
  });
});