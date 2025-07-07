import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import VotosService from '../services/votos-service';

const initialState = {
  currentElectionIndex: 0,
  votes: [],
  votoCompleto: null,
  isVotingComplete: false,
  isSubmitting: false,
  submitError: null,
  submitSuccess: false,
};

export const enviarVotoCompleto = createAsyncThunk(
  'voting/enviarVotoCompleto',
  async (votoData, { rejectWithValue }) => {
    try {
      const response = await VotosService.enviarVoto(votoData);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const votingSlice = createSlice({
  name: 'voting',
  initialState,
  reducers: {
    resetVoting: (state) => {
      state.currentElectionIndex = 0;
      state.votes = [];
      state.votoCompleto = null;
      state.isVotingComplete = false;
      state.isSubmitting = false;
      state.submitError = null;
      state.submitSuccess = false;
    },
    registrarVoto: (state, action) => {
      const { eleccionId, lista } = action.payload;
      
      const existingVoteIndex = state.votes.findIndex(vote => vote.eleccion_id === eleccionId);
      
      const voteData = {
        eleccion_id: eleccionId,
        lista_seleccionada: lista,
        timestamp: new Date().toISOString()
      };
      
      if (existingVoteIndex >= 0) {
        state.votes[existingVoteIndex] = voteData;
      } else {
        state.votes.push(voteData);
      }
    },
    avanzarEleccion: (state) => {
      state.currentElectionIndex += 1;
    },
    retrocederEleccion: (state) => {
      if (state.currentElectionIndex > 0) {
        state.currentElectionIndex -= 1;
      }
    },
    completarVotacion: (state) => {
      state.isVotingComplete = true;
    },
    clearSubmitError: (state) => {
      state.submitError = null;
    },
    prepararVotoCompleto: (state, action) => {
      const { ciudadano, circuito } = action.payload;
      
      const papeletasPorEleccion = {};
      
      state.votes.forEach(vote => {
        if (!papeletasPorEleccion[vote.eleccion_id]) {
          papeletasPorEleccion[vote.eleccion_id] = [];
        }
        
        if (vote.lista_seleccionada.nro_lista) {
          papeletasPorEleccion[vote.eleccion_id].push({
            papeleta_id: vote.lista_seleccionada.id,
            nro_lista: vote.lista_seleccionada.nro_lista
          });
        } else {
          papeletasPorEleccion[vote.eleccion_id].push({
            papeleta_id: vote.lista_seleccionada.id,
            es_si: vote.lista_seleccionada.es_si
          });
        }
      });
      
      state.votoCompleto = {
        ciudadano_credencial: ciudadano.credencial,
        circuito_direccion: circuito.direccion,
        circuito_numero: circuito.numero,
        tipo: ciudadano.tipo === 'observado' ? 'Observado' : 'Normal',
        papeletas_por_eleccion: papeletasPorEleccion
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(enviarVotoCompleto.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(enviarVotoCompleto.fulfilled, (state) => {
        state.isSubmitting = false;
        state.submitSuccess = true;
        state.submitError = null;
      })
      .addCase(enviarVotoCompleto.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload;
        state.submitSuccess = false;
      });
  },
});

export const selectCurrentElectionIndex = (state) => state.voting.currentElectionIndex;
export const selectVotes = (state) => state.voting.votes;
export const selectVotoCompleto = (state) => state.voting.votoCompleto;
export const selectIsVotingComplete = (state) => state.voting.isVotingComplete;
export const selectIsSubmitting = (state) => state.voting.isSubmitting;
export const selectSubmitError = (state) => state.voting.submitError;
export const selectSubmitSuccess = (state) => state.voting.submitSuccess;

export const selectVoteForElection = (state, eleccionId) => 
  state.voting.votes.find(vote => vote.eleccion_id === eleccionId);

export const { 
  resetVoting, 
  registrarVoto, 
  avanzarEleccion, 
  retrocederEleccion, 
  completarVotacion, 
  clearSubmitError,
  prepararVotoCompleto 
} = votingSlice.actions;

export default votingSlice.reducer;
