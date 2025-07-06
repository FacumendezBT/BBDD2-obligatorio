import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import EleccionesService from '../services/elecciones-service';

const initialState = {
  eleccionesActivas: [],
  listas: [],
  stats: null,
  loading: false,
  error: null,
  isInitialized: false,
};

export const cargarEleccionesActivas = createAsyncThunk(
  'elecciones/cargarEleccionesActivas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await EleccionesService.getEleccionesActivas();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const cargarListasEleccion = createAsyncThunk(
  'elecciones/cargarListasEleccion',
  async (electionId, { rejectWithValue }) => {
    try {
      const response = await EleccionesService.getListasEleccion(electionId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const cargarStatsEleccion = createAsyncThunk(
  'elecciones/cargarStatsEleccion',
  async (electionId, { rejectWithValue }) => {
    try {
      const response = await EleccionesService.getStatsEleccion(electionId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const eleccionesSlice = createSlice({
  name: 'elecciones',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetElecciones: (state) => {
      state.eleccionesActivas = [];
      state.listas = [];
      state.stats = null;
      state.loading = false;
      state.error = null;
      state.isInitialized = false;
    },
    clearListas: (state) => {
      state.listas = [];
    },
    clearStats: (state) => {
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    // Cargar elecciones activas
    builder
      .addCase(cargarEleccionesActivas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarEleccionesActivas.fulfilled, (state, action) => {
        state.loading = false;
        state.eleccionesActivas = action.payload;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(cargarEleccionesActivas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = false;
      });

    // Cargar listas de elección
    builder
      .addCase(cargarListasEleccion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarListasEleccion.fulfilled, (state, action) => {
        state.loading = false;
        state.listas = action.payload;
        state.error = null;
      })
      .addCase(cargarListasEleccion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Cargar estadísticas de elección
    builder
      .addCase(cargarStatsEleccion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarStatsEleccion.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(cargarStatsEleccion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Selectores
export const selectEleccionesActivas = (state) => state.elecciones.eleccionesActivas;
export const selectListasEleccion = (state) => state.elecciones.listas;
export const selectStatsEleccion = (state) => state.elecciones.stats;
export const selectEleccionesLoading = (state) => state.elecciones.loading;
export const selectEleccionesError = (state) => state.elecciones.error;
export const selectEleccionesIsInitialized = (state) => state.elecciones.isInitialized;

// Acciones
export const { clearError, resetElecciones, clearListas, clearStats } = eleccionesSlice.actions;

// Reducer
export default eleccionesSlice.reducer;
