"""Health endpoint for the Japanese AI dinner experiment."""

from api.aitest.core import Handler


class handler(Handler):
    """Expose the existing health response as a Vercel Python Function."""

    def app_path(self) -> str:
        return "/api/health"
