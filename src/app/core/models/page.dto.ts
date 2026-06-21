/**
 * Espelha a estrutura de paginacao do Spring Data (objeto Page) retornada
 * pela API. Mantida separada para reuso por qualquer recurso paginado.
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // indice da pagina atual (0-based)
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}
