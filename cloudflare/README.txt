PupScene Demo analytics setup (Cloudflare)

The demo frontend POSTs lead/visit/usage events to /api/demo-event.
For central analytics, connect that route to a Cloudflare Worker or Pages Function and bind a D1 database as DB.
1. Create a D1 database.
2. Run schema.sql.
3. Bind it as DB.
4. Route POST /api/demo-event to the handler logic in demo-event-handler.js.

Until the endpoint is live, events are queued in the visitor's browser and retried later. When the D1 endpoint is live, the 10-generation limit is checked server-side by email before new storyboard generation. The browser counter remains as an offline fallback. A user can still obtain another allowance by supplying a different email unless you later add account/email verification.
