import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { vi } from 'vitest';

// Mock services
vi.mock('../../src/api/RealmService', () => ({
  default: {
    addRealm: vi.fn().mockResolvedValue({
      status: 200,
      data: { message: 'Realm added successfully' }
    }),
    checkRealmName: vi.fn().mockResolvedValue({
      status: 200,
      data: { exists: false }
    })
  }
}));

// Mock i18n
vi.mock('../../src/i18n', () => ({
  default: {
    t: (key) => key
  }
}));

// Mock AuthenticationServiceComponent
vi.mock('../../src/views/Common/AuthenticationServiceComponent', () => ({
  default: () => null
}));

// Mock reactstrap components
vi.mock('reactstrap', () => ({
  Button: (props) => <button {...props}>{props.children}</button>,
  Card: (props) => <div className="card">{props.children}</div>,
  CardBody: (props) => <div className="card-body">{props.children}</div>,
  CardFooter: (props) => <div className="card-footer">{props.children}</div>,
  Form: (props) => <form {...props}>{props.children}</form>,
  FormGroup: (props) => <div className="form-group">{props.children}</div>,
  Label: (props) => <label {...props}>{props.children}</label>,
  Input: ({ children, ...props }) => <input {...props} />,
  FormFeedback: (props) => <div className="invalid-feedback">{props.children}</div>,
  Row: (props) => <div className="row">{props.children}</div>,
  Col: (props) => <div className="col">{props.children}</div>
}));

// Import after mocks
import AddRealmComponent from '../../src/views/Realm/AddRealmComponent';
import RealmService from '../../src/api/RealmService';

describe('AddRealmComponent', () => {
  const history = createMemoryHistory();

  const renderComponent = () => {
    return render(
      <Router history={history}>
        <AddRealmComponent 
          match={{ params: {}, path: '/realms/add', url: '/realms/add' }}
          location={history.location}
          history={history}
        />
      </Router>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillRequiredFields = async () => {
    // Fill text fields using IDs
    fireEvent.change(document.getElementById('label'), {
      target: { value: 'TestRealm' }
    });
    // Trigger blur to validate
    fireEvent.blur(document.getElementById('label'));
    
    fireEvent.change(document.getElementById('realmCode'), {
      target: { value: 'TEST001' }
    });
    fireEvent.blur(document.getElementById('realmCode'));

    // Fill number fields
    const numberFields = [
      { id: 'minMosMinGaurdrail', value: '1' },
      { id: 'minMosMaxGaurdrail', value: '1' },
      { id: 'maxMosMaxGaurdrail', value: '1' },
      { id: 'minQplTolerance', value: '1' },
      { id: 'minQplToleranceCutOff', value: '1' },
      { id: 'maxQplTolerance', value: '1' },
      { id: 'actualConsumptionMonthsInPast', value: '6' },
      { id: 'forecastConsumptionMonthsInPast', value: '4' },
      { id: 'inventoryMonthsInPast', value: '6' },
      { id: 'minCountForMode', value: '1' },
      { id: 'minPercForMode', value: '1' }
    ];

    numberFields.forEach(({ id, value }) => {
      const input = document.getElementById(id);
      if (input) {
        fireEvent.change(input, {
          target: { value }
        });
        fireEvent.blur(input);
      }
    });

    // Set default realm radio
    const yesRadio = document.getElementById('active1');
    if (!yesRadio.checked) {
      fireEvent.click(yesRadio);
    }

    // Wait for validation to complete
    await waitFor(() => {
      const submitButton = screen.getByText('static.common.submit');
      expect(submitButton).not.toBeDisabled();
    });
  };

  describe('Rendering', () => {
    test('renders form fields correctly', () => {
      renderComponent();

      // Check for text fields
      expect(document.getElementById('label')).toBeInTheDocument();
      expect(document.getElementById('realmCode')).toBeInTheDocument();

      // Check for number fields
      expect(document.getElementById('minMosMinGaurdrail')).toBeInTheDocument();
      expect(document.getElementById('maxMosMaxGaurdrail')).toBeInTheDocument();

      // Check for buttons
      expect(screen.getByText('static.common.submit')).toBeInTheDocument();
      expect(screen.getByText('static.common.cancel')).toBeInTheDocument();
      expect(screen.getByText('static.common.reset')).toBeInTheDocument();
    });

    test('renders default realm radio buttons', () => {
      renderComponent();
      expect(screen.getByText('static.realm.default')).toBeInTheDocument();
      const yesRadio = document.getElementById('active1');
      const noRadio = document.getElementById('active2');
      expect(yesRadio).toBeInTheDocument();
      expect(noRadio).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('shows validation errors for empty required fields', async () => {
      renderComponent();

      // Submit empty form
      fireEvent.click(screen.getByText('static.common.submit'));

      // Check for validation messages
      await waitFor(() => {
        const feedbackElements = document.getElementsByClassName('invalid-feedback');
        expect(feedbackElements.length).toBeGreaterThan(0);
      });
    });

    test('validates realm name uniqueness', async () => {
      RealmService.checkRealmName.mockResolvedValueOnce({
        status: 200,
        data: { exists: true }
      });

      renderComponent();

      // Type existing realm name
      fireEvent.change(document.getElementById('label'), {
        target: { value: 'ExistingRealm' }
      });
      fireEvent.blur(document.getElementById('label'));

      // Check for existence message
      await waitFor(() => {
        const feedbackElements = Array.from(document.getElementsByClassName('invalid-feedback'));
        const errorMessage = feedbackElements.find(el => el.textContent)?.textContent;
        expect(errorMessage).toBe('static.realm.realmCodeText');
      });
    });
  });

  describe('Form Submission', () => {
    test('submits form with valid data', async () => {
      renderComponent();

      // Fill form with valid data
      const formInputs = {
        label: 'TestRealm',
        realmCode: 'TEST01',
        minMosMinGaurdrail: '1',
        minMosMaxGaurdrail: '2',
        maxMosMaxGaurdrail: '3',
        minQplTolerance: '1',
        minQplToleranceCutOff: '1',
        maxQplTolerance: '2',
        actualConsumptionMonthsInPast: '6',
        forecastConsumptionMonthsInPast: '4',
        inventoryMonthsInPast: '6',
        minCountForMode: '1',
        minPercForMode: '50',
        defaultRealm: 'true'
      };

      // Fill each field
      for (const [id, value] of Object.entries(formInputs)) {
        const element = document.getElementById(id === 'defaultRealm' ? 'active1' : id);
        if (element) {
          fireEvent.change(element, { target: { value } });
          fireEvent.blur(element);
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      // Expected data structure that will be sent to API
      const expectedData = {
        label: {
          label_en: 'TestRealm',
          label_fr: '',
          label_pr: '',
          label_sp: ''
        },
        realmCode: 'TEST01',
        minMosMinGaurdrail: '1',
        minMosMaxGaurdrail: '2',
        maxMosMaxGaurdrail: '3',
        minQplTolerance: '1',
        minQplToleranceCutOff: '1',
        maxQplTolerance: '2',
        actualConsumptionMonthsInPast: 6,
        forecastConsumptionMonthsInPast: 4,
        inventoryMonthsInPast: 6,
        minCountForMode: '1',
        minPercForMode: '50',
        defaultRealm: true
      };

      // Submit form
      const submitButton = screen.getByText('static.common.submit');
      fireEvent.click(submitButton);

      // Verify API call with the expected data structure
      await waitFor(() => {
        expect(RealmService.addRealm).toHaveBeenCalledWith(expectedData);
      }, { timeout: 1000 });
    });

    test('handles API error during submission', async () => {
      RealmService.addRealm.mockRejectedValueOnce(new Error('API Error'));

      renderComponent();
      await fillRequiredFields();

      // Submit form
      fireEvent.click(screen.getByText('static.common.submit'));

      // Check for error message
      await waitFor(() => {
        expect(document.querySelector('.red')).toBeInTheDocument();
      });
    });
  });

  describe('Form Reset', () => {
    test('resets form to initial values', async () => {
      renderComponent();
      
      // Fill form
      await fillRequiredFields();

      // Click reset button
      fireEvent.click(screen.getByText('static.common.reset'));

      // Verify fields are reset
      expect(document.getElementById('label').value).toBe('');
      expect(document.getElementById('realmCode').value).toBe('');
    });
  });

  describe('Navigation', () => {
    test('navigates back on cancel', () => {
      renderComponent();

      // Click cancel button
      fireEvent.click(screen.getByText('static.common.cancel'));

      // Verify navigation
      expect(history.location.pathname).toBe('/realm/listRealm/red/static.message.cancelled');
    });
  });

  describe('Default Realm Selection', () => {
    test('toggles default realm radio buttons', () => {
      renderComponent();

      const yesRadio = document.getElementById('active1');
      const noRadio = document.getElementById('active2');

      // Initially 'Yes' should be selected
      expect(yesRadio).toBeChecked();
      expect(noRadio).not.toBeChecked();

      // Click 'No'
      fireEvent.click(noRadio);
      expect(yesRadio).not.toBeChecked();
      expect(noRadio).toBeChecked();
    });
  });
});