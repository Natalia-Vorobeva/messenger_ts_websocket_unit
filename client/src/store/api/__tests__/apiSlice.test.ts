import { describe, it, expect } from 'vitest';
import reducer, {
  setDataMessages,
  moveMessageReducer,
  deleteMessageReducer,
  updateLike,
} from '../apiSlice';
import { MessagesData } from '../../../types';

const initialState = {
  idLast: null,
  isModal: false,
  dataMessages: {
    leftCol: [],
    centralCol: [],
    rightCol: [],
  },
  btnFilterFavourites: true,
  isReverse: false,
  isSearched: false,
  choice: null,
};

const sampleMessages: MessagesData = {
  leftCol: [{ id: 1, content: 'left', date: '2025-01-01T12:00:00Z', liked: false, author: 'A' }],
  centralCol: [{ id: 2, content: 'central', date: '2025-01-02T12:00:00Z', liked: true, author: 'B' }],
  rightCol: [],
};

describe('apiSlice', () => {
  it('setDataMessages replaces all messages', () => {
    const newState = reducer(initialState, setDataMessages(sampleMessages));
    expect(newState.dataMessages).toEqual(sampleMessages);
  });

  it('updateLike toggles liked property', () => {
    const state = { ...initialState, dataMessages: sampleMessages };
    const action = updateLike({ id: 1, column: 'left', liked: true });
    const newState = reducer(state, action);
    expect(newState.dataMessages.leftCol[0].liked).toBe(true);
  });

  it('moveMessageReducer moves message between columns', () => {
  const state = { ...initialState, dataMessages: sampleMessages };
  const action = moveMessageReducer({ id: 1, fromColumn: 'left', toColumn: 'central' });
  const newState = reducer(state, action);
  expect(newState.dataMessages.leftCol).toHaveLength(0);
  expect(newState.dataMessages.centralCol).toHaveLength(2);
});

  it('deleteMessageReducer removes message', () => {
  const state = { ...initialState, dataMessages: sampleMessages };
  // Используем импортированный экшен вместо строки
  const action = deleteMessageReducer({ id: 2, column: 'central' });
  const newState = reducer(state, action);
  expect(newState.dataMessages.centralCol).toHaveLength(0);
});

});