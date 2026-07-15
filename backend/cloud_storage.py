import os
import cloudinary
import cloudinary.uploader
import cloudinary.utils
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


def upload_resume(local_file_path: str, file_id: str) -> str:
    """
    Uploads a resume PDF to Cloudinary as an authenticated (private) file.
    Returns the Cloudinary public_id to store in the database — this is
    NOT a public URL, so it can't be viewed without a signed link.
    """
    result = cloudinary.uploader.upload(
        local_file_path,
        resource_type="raw",
        type="authenticated",
        public_id=f"resumes/{file_id}",
        overwrite=False,
    )
    return result["public_id"]


def get_resume_signed_url(public_id: str, expires_in_seconds: int = 300) -> str:
    """
    Generates a signed, time-limited URL for viewing a private resume.
    Expires after a few minutes by default — safe to regenerate each
    time someone clicks "View resume".
    """
    url, _ = cloudinary.utils.cloudinary_url(
        public_id,
        resource_type="raw",
        type="authenticated",
        sign_url=True,
        expires_at=int(__import__("time").time()) + expires_in_seconds,
    )
    return url


def delete_resume(public_id: str) -> None:
    cloudinary.uploader.destroy(
        public_id,
        resource_type="raw",
        type="authenticated",
    )