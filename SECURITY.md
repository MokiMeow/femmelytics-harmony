# Security policy

Please report suspected vulnerabilities privately through GitHub's security
advisory flow. Do not include health data, access tokens, provider keys, or other
sensitive records in a public issue.

Supported security fixes target the current default branch. Rotate a credential
immediately if it is ever committed; deleting it from the latest tree does not
invalidate the exposed value or remove it from Git history.

The Supabase publishable client key is intentionally public. Sensitive access is
controlled by authenticated sessions and row-level security. The OpenAI key is a
server-side Supabase secret and must never be prefixed with `VITE_`.
