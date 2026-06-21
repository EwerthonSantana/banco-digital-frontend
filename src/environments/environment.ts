/**
 * Configuracao de ambiente.
 *
 * A API e chamada por 127.0.0.1 (IPv4 explicito) em vez de "localhost".
 * No Windows, "localhost" pode resolver para IPv6 (::1), onde o Docker nao
 * publica a porta, causando travamento. Usar 127.0.0.1 evita esse problema.
 *
 * O CORS do backend libera as origens localhost:4200 e 127.0.0.1:4200.
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://127.0.0.1:8080/api/v1',
};
