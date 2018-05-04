export const reducer = (state = { selected: 0 }, action) => {
  switch (action.type) {
  case 'UPDATE_ROUTE':
    return { ...state, error: '', selected: action.payload };
  default:
    return state;
  }
};