import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import CircuitosService from '../services/circuitos-service';

const initialState = {
  nroCircuito: null,
  direccionCircuito: null,
  loading: false,
  error: null,
  isInitialized: false,
};

export const cargarCircuitoPorIp = createAsyncThunk('totem/cargarCircuitoPorIp', async (_, { rejectWithValue }) => {
  try {
    const response = await CircuitosService.nroCircuitoPorIp();
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

const totemSlice = createSlice({
  name: 'totem',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetTotem: (state) => {
      state.nroCircuito = null;
      state.direccionCircuito = null;
      state.loading = false;
      state.error = null;
      state.isInitialized = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cargarCircuitoPorIp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarCircuitoPorIp.fulfilled, (state, action) => {
        state.loading = false;
        state.nroCircuito = action.payload.numero;
        state.direccionCircuito = action.payload.direccion;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(cargarCircuitoPorIp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = false;
      });
  },
});

// Selectores
export const selectTotem = (state) => {
  return {
    nroCircuito: state.totem.nroCircuito,
    direccionCircuito: state.totem.direccionCircuito,
  };
};
export const selectTotemLoading = (state) => state.totem.loading;
export const selectTotemError = (state) => state.totem.error;
export const selectTotemIsInitialized = (state) => state.totem.isInitialized;

// Acciones
export const { clearError, resetTotem } = totemSlice.actions;

// Reducer
export default totemSlice.reducer;
