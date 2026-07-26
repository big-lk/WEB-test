# `/aitest` deployment

The Japanese eye-tracking experiment is mounted inside the existing portfolio:

- UI: `https://lkdesigner.top/aitest`
- Health check: `https://lkdesigner.top/aitest/api/health`
- Conversation API: `https://lkdesigner.top/aitest/api/turn`

The browser never receives the OpenAI API key. Configure these Vercel environment
variables for Production and Preview:

```text
OPENAI_API_KEY
OPENAI_DIALOGUE_MODEL=gpt-5.4-nano
OPENAI_ANALYSIS_MODEL=gpt-5.4-nano
EXPERIMENT_RATE_LIMIT_PER_MINUTE=12
EXPERIMENT_TRUST_PROXY=1
```

`next.config.mjs` keeps the public API under `/aitest/api/*` and forwards it to
the Python functions in `api/aitest/`. The full-screen experiment UI is served
from `public/aitest/` without the portfolio header and footer.

Do not commit `.env` files or API keys.
