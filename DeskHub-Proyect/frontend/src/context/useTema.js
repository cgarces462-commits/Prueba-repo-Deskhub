import { useContext } from 'react';
import { TemaContext } from './TemaContext';

export function useTema() {
  return useContext(TemaContext);
}
