import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { vi } from 'vitest';
import EditRealmComponent from '../../src/views/Realm/EditRealmComponent';
import RealmService from '../../src/api/RealmService';

// Mock services
vi.mock('../../src/api/RealmService', () => ({
  default: {
    getRealmById: vi.fn().mockResolvedValue({
      status: 200,
      data: {
        label: {
          label_en: 'ExistingRealm',
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
        defaultRealm: true,
        active: true
      }
    }),
    updateRealm: vi.fn().mockResolvedValue({
      status: 200,
      data: { message: 'Realm updated successfully' }
    }),
    checkRealmName: vi.fn().mockResolvedValue({
      status: 200,
      data: { exists: false }
    })
  }
}));

vi.mock('../../src/i18n', () => ({
  default: {
    t: (key) => key
  }
}));

describe('EditRealmComponent', () => {
  let history;
  const realmId = '123';

  beforeEach(() => {
    history = createMemoryHistory();
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Router history={history}>
        <EditRealmComponent 
          match={{ params: { realmId }, path: '/realms/edit/:realmId', url: `/realms/edit/${realmId}` }}
          location={history.location}
          history={history}
        />
      </Router>
    );
  };

  test('loads existing realm data on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(document.getElementById('label').value).toBe('ExistingRealm');
      expect(document.getElementById('realmCode').value).toBe('TEST01');
    });
  });

  test('updates realm data successfully', async () => {
    renderComponent();

    // Wait for initial data load
    await waitFor(() => {
      expect(document.getElementById('label').value).toBe('ExistingRealm');
    });

    // Update fields
    const updatedFormData = {
      label: 'UpdatedRealm',
      realmCode: 'TEST02',
      minMosMinGaurdrail: '2',
      minMosMaxGaurdrail: '3',
      maxMosMaxGaurdrail: '4'
    };

    // Fill form with updated data
    for (const [id, value] of Object.entries(updatedFormData)) {
      const input = document.getElementById(id);
      fireEvent.change(input, { target: { value } });
      fireEvent.blur(input);
    }

    // Submit form
    const submitButton = screen.getByText('static.common.update');
    fireEvent.click(submitButton);

    // Verify API call
    await waitFor(() => {
      expect(document.getElementById('label').value).toBe('UpdatedRealm');
      expect(document.getElementById('realmCode').value).toBe('TEST02');
    });
  });

  test('handles API error during update', async () => {
    const mockError = new Error('Update failed');
    vi.mocked(RealmService.updateRealm).mockRejectedValueOnce(mockError);
    
    renderComponent();

    await waitFor(() => {
      expect(document.getElementById('label').value).toBe('UpdatedRealm');
    });

    // Update a field
    const labelInput = document.getElementById('label');
    fireEvent.change(labelInput, { target: { value: 'UpdatedRealm' } });
    fireEvent.blur(labelInput);

    // Submit form
    const submitButton = screen.getByText('static.common.update');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorElement = document.querySelector('.red');
      expect(errorElement).toBeInTheDocument();
    });
  });

  test('navigates back on cancel', async () => {
    renderComponent();

    await waitFor(() => {
      expect(document.getElementById('label').value).toBe('UpdatedRealm');
    });

    const cancelButton = screen.getByText('static.common.cancel');
    fireEvent.click(cancelButton);

    expect(history.location.pathname).toBe('/realm/listRealm/red/static.message.cancelled');
  });
}); 