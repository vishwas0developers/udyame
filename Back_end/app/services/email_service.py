import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

class EmailService:
    @staticmethod
    def send_verification_email(email_to: str, token: str):
        """
        Sends a verification link to the user's email.
        """
        if not settings.SMTP_HOST:
            # For development, log the token to the console if SMTP is not configured
            print(f"--- EMAIL VERIFICATION ---")
            print(f"To: {email_to}")
            print(f"Token: {token}")
            print(f"Link: http://localhost:3000/verify?token={token}")
            print(f"--------------------------")
            return

        message = MIMEMultipart()
        message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        message["To"] = email_to
        message["Subject"] = "Verify your Udyame AI account"

        verification_link = f"http://localhost:3000/verify?token={token}"
        body = f"Please click the link below to verify your account:\n\n{verification_link}"
        message.attach(MIMEText(body, "plain"))

        try:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(message)
        except Exception as e:
            print(f"Failed to send email: {e}")

    @staticmethod
    def send_magic_link(email_to: str, token: str):
        """
        Sends a magic link for password-less login.
        """
        magic_link = f"http://localhost:5012/api/v1/auth/magic-login?token={token}"
        
        if not settings.SMTP_HOST:
            print(f"--- MAGIC LINK LOGIN ---")
            print(f"To: {email_to}")
            print(f"Link: {magic_link}")
            print(f"--------------------------")
            return

        message = MIMEMultipart()
        message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        message["To"] = email_to
        message["Subject"] = "Your Udyame AI Magic Login Link"

        body = f"Click the link below to sign in to your Udyame AI account:\n\n{magic_link}\n\nThis link will only work once."
        message.attach(MIMEText(body, "plain"))

        try:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(message)
        except Exception as e:
            print(f"Failed to send magic link email: {e}")

email_service = EmailService()
