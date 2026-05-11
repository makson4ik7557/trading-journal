import { requireAdmin, renderUserChrome } from '../router.js';

if (!requireAdmin()) {
    throw new Error('Not authorized');
}

renderUserChrome();