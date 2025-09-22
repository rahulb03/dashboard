// Type definitions for Redux store (JavaScript version)
// This file provides JSDoc type annotations for better IDE support

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [mobile]
 * @property {string} role
 * @property {string} createdAt
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user
 * @property {string|null} token
 * @property {boolean} isAuthenticated
 * @property {boolean} loading
 * @property {string|null} error
 */

/**
 * @typedef {Object} RootState
 * @property {AuthState} auth
 */

export {};
