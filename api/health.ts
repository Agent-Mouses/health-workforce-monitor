export const config = { runtime: 'edge' };

import { ALL_FEEDS } from './health-workforce/v1/_feeds';

export default function handler() {
  return Response.json({
    status: 'ok',
    feeds: ALL_FEEDS.length,
    endpoints: ['/api/health-workforce/v1/digest'],
  });
}
