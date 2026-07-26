"""Conversation endpoint for the Japanese AI dinner experiment."""

from api.aitest.core import Handler


class handler(Handler):
    """Expose the validated two-AI pipeline as a Vercel Python Function."""

    def app_path(self) -> str:
        return "/api/turn"
