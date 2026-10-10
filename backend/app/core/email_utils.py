import smtplib
from email.message import EmailMessage
from app.core.config import settings


def send_email(to_email: str, subject: str, body: str):
    if not settings.SMTP_HOST:
        # SMTP not configured; skip sending
        return False
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    msg.set_content(body)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASS:
                server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.send_message(msg)
        return True
    except Exception:
        return False
