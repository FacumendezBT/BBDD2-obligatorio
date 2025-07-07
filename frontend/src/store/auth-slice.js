import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../services/auth-service';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const loginVotante = createAsyncThunk('auth/loginVotante', async (credencial, { rejectWithValue }) => {
  try {
    const response = await AuthService.loginVotante(credencial);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const loginUsuario = createAsyncThunk('auth/loginUsuario', async ({ credencial, password }, { rejectWithValue }) => {
  try {
    const response = await AuthService.loginUsuario(credencial, password);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const loginMiembroMesa = createAsyncThunk(
  'auth/loginMiembroMesa',
  async ({ credencial, password }, { rejectWithValue }) => {
    try {
      const response = await AuthService.loginUsuario(credencial, password);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await AuthService.logout();
    return null;
  } catch (error) {
    return rejectWithValue(error);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login de votante
    builder
      .addCase(loginVotante.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginVotante.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.tokenito;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginVotante.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });

    // Login de usuario
    builder
      .addCase(loginUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUsuario.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.tokenito;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUsuario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });

    // Login de miembro de mesa
    builder
      .addCase(loginMiembroMesa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginMiembroMesa.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.tokenito;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginMiembroMesa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Aunque falle el logout, limpiar el estado local
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export const { clearError, resetAuth } = authSlice.actions;

export default authSlice.reducer;
