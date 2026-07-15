"""
Run this directly to test ONLY your Cloudinary credentials, isolated
from the rest of the app: python test_cloudinary.py

If this fails with the same "Invalid Signature" error, it's 100%
confirmed to be a credentials problem in your .env — not a bug in
the app's code.
"""
import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
api_key = os.getenv("CLOUDINARY_API_KEY")
api_secret = os.getenv("CLOUDINARY_API_SECRET")

# Print masked versions so you can sanity-check what actually got loaded
# from .env, without printing the real secret to your terminal.
def mask(value):
    if not value:
        return "(EMPTY / NOT FOUND)"
    if len(value) <= 6:
        return "*" * len(value)
    return value[:3] + "*" * (len(value) - 6) + value[-3:]

print("Loaded from .env:")
print(f"  CLOUDINARY_CLOUD_NAME = {mask(cloud_name)}  (length: {len(cloud_name or '')})")
print(f"  CLOUDINARY_API_KEY    = {mask(api_key)}  (length: {len(api_key or '')})")
print(f"  CLOUDINARY_API_SECRET = {mask(api_secret)}  (length: {len(api_secret or '')})")
print()

cloudinary.config(
    cloud_name=cloud_name,
    api_key=api_key,
    api_secret=api_secret,
    secure=True,
)

# Create a tiny throwaway text file to upload as a test
with open("test_upload.txt", "w") as f:
    f.write("This is a Cloudinary connection test.")

try:
    result = cloudinary.uploader.upload(
        "test_upload.txt",
        resource_type="raw",
        type="authenticated",
        public_id="connection_test",
        overwrite=True,
    )
    print("SUCCESS — Cloudinary credentials are working correctly.")
    print(f"Uploaded as: {result['public_id']}")
except Exception as e:
    print("FAILED — credentials are not working.")
    print(f"Error: {e}")
finally:
    os.remove("test_upload.txt")