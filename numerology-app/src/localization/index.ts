/**
 * Localization module
 * Exports messages and localization utilities
 */

export { messages, type Messages } from './messages';

// For future multi-language support, we could add:
// - useTranslation hook
// - language switching
// - message interpolation
// For MVP, we keep it simple with direct message access

import messages from './messages';
export default messages;
