/**
 * tokenStore.js
 *
 * A tiny singleton that holds the JWT access token in memory only.
 * Lives outside React so axiosInstance can read it without circular imports.
 * The token is NEVER written to localStorage or sessionStorage.
 */

let _accessToken = null;

export const tokenStore = {
  get: ()       => _accessToken,
  set: (token)  => { 
    _accessToken = token; 
    console.log("Here is your JWT Token from memory: ", _accessToken);
  },
  clear: ()     => { _accessToken = null; },
};
