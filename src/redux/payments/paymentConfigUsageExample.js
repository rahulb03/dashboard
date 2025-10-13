// Example usage of Payment Configuration Redux

// 1. In your component, import the required hooks and thunks:
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPaymentConfigsThunk,
  createPaymentConfigThunk,
  updatePaymentConfigThunk,
  deletePaymentConfigThunk,
  togglePaymentConfigThunk,
  fetchActivePaymentConfigsThunk
} from './paymentConfigThunks';

function PaymentConfigComponent() {
  const dispatch = useDispatch();
  
  // Get state from Redux store
  const {
    paymentConfigs,        // Array of all payment configurations
    activePaymentConfigs,  // Array of active payment configurations
    currentPaymentConfig,  // Currently selected payment configuration
    loading,              // Loading state
    error,                // Error message
    validationErrors,     // Validation errors from API
    stats                 // Statistics (total, active, inactive, by type)
  } = useSelector((state) => state.paymentConfig);

  // Fetch all payment configurations
  const handleFetchAll = () => {
    dispatch(fetchPaymentConfigsThunk());
  };

  // Fetch with filters
  const handleFetchFiltered = () => {
    dispatch(fetchPaymentConfigsThunk({
      type: 'LOAN_FEE',
      isActive: 'true'
    }));
  };

  // Create new payment configuration
  const handleCreate = () => {
    const newConfig = {
      type: 'LOAN_FEE',
      amount: 50.00,
      description: 'Standard loan processing fee',
      isActive: true,
      metadata: {}
    };
    
    dispatch(createPaymentConfigThunk(newConfig))
      .unwrap()
      .then((result) => {
        // console.log('Created:', result);
      })
      .catch((error) => {
        console.error('Create failed:', error);
      });
  };

  // Update payment configuration
  const handleUpdate = (id) => {
    const updates = {
      amount: 75.00,
      description: 'Updated fee amount'
    };
    
    dispatch(updatePaymentConfigThunk({
      paymentConfigId: id,
      paymentConfigData: updates
    }));
  };

  // Delete payment configuration
  const handleDelete = (id) => {
    dispatch(deletePaymentConfigThunk(id));
  };

  // Toggle active status
  const handleToggle = (id) => {
    dispatch(togglePaymentConfigThunk(id));
  };

  // Fetch only active configurations
  const handleFetchActive = () => {
    dispatch(fetchActivePaymentConfigsThunk({ type: 'MEMBERSHIP' }));
  };

  return (
    <div>
      <h2>Payment Configurations</h2>
      
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      
      <div>Stats: {stats.total} total, {stats.active} active</div>
      
      <button onClick={handleFetchAll}>Fetch All</button>
      <button onClick={handleFetchFiltered}>Fetch Filtered</button>
      <button onClick={handleFetchActive}>Fetch Active Only</button>
      <button onClick={handleCreate}>Create New</button>
      
      <ul>
        {paymentConfigs.map(config => (
          <li key={config.id}>
            {config.type}: ${config.amount} - {config.isActive ? 'Active' : 'Inactive'}
            <button onClick={() => handleUpdate(config.id)}>Update</button>
            <button onClick={() => handleToggle(config.id)}>Toggle</button>
            <button onClick={() => handleDelete(config.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PaymentConfigComponent;

/*
API Endpoints this connects to:

1. GET /api/admin/payments-config - fetchPaymentConfigsThunk()
2. POST /api/admin/payments-config - createPaymentConfigThunk(data)
3. GET /api/admin/payments-config/:id - fetchPaymentConfigByIdThunk({paymentConfigId})
4. PUT /api/admin/payments-config/:id - updatePaymentConfigThunk({paymentConfigId, paymentConfigData})
5. DELETE /api/admin/payments-config/:id - deletePaymentConfigThunk(id)
6. PATCH /api/admin/payments-config/:id/toggle - togglePaymentConfigThunk(id)
7. GET /api/admin/payments-config/active - fetchActivePaymentConfigsThunk({type})
*/