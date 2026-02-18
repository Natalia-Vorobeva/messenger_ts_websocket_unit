import { AppState, SelectedCard } from '../../types';

export const apiSelectors = {
  getIdLast: (state: { api: AppState }) => state.api.idLast,
  getDataMessages: (state: { api: AppState }) => state.api.dataMessages,
  getIsModal: (state: { api: AppState }) => state.api.isModal,
  getBtnFilterFavourites: (state: { api: AppState }) => state.api.btnFilterFavourites,
  getChoice: (state: { api: AppState }): SelectedCard | null => state.api.choice,
  getIsReverse: (state: { api: AppState }) => state.api.isReverse,
};