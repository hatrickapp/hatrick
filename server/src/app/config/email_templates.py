from dataclasses import asdict, dataclass
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
from markupsafe import Markup, escape

from src.app.config.settings import settings

BASE_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = BASE_DIR.parent / "templates"

jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(["html"])
)

class BaseTemplate:
    template_file: str  # Requirement for subclasses

    def render(self) -> str:
        template = jinja_env.get_template(self.template_file)
        
        app_name = settings.app.name
        app_name_html = Markup(f'<span style="color:#3F9B0B;">{escape(app_name)}</span>')
        context = asdict(self)
        context.update({
            "app_name": app_name,
            "app_name_html": app_name_html,
            "otp_expire_minutes": settings.otp.expire_minutes
        })
        
        return template.render(**context)

    @property
    def html(self) -> str:
        return self.render()

@dataclass
class DeletionTemplate(BaseTemplate):
    otp: str
    device: str
    country: str
    timestamp: str
    template_file = "deletion.html"

    @property
    def subject(self) -> str:
        return f"{settings.app.name} Account Deletion"

@dataclass
class AccountDeletionSuccessTemplate(BaseTemplate):
    device: str
    country: str
    timestamp: str
    template_file = "deletion_success.html"

    @property
    def subject(self) -> str:
        return f"Your {settings.app.name} account has been deleted"

@dataclass
class OAuthWelcomeTemplate(BaseTemplate):
    provider: str
    device: str
    country: str
    timestamp: str
    template_file = "oauth_welcome.html"

    @property
    def subject(self) -> str:
        return f"Welcome to {settings.app.name} — signed in via {self.provider}"
