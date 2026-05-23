"""
FinFlow — Google OAuth2 Verification
Stub for development. In production, verify the token with Google's API.
"""
import httpx
from fastapi import HTTPException


async def verify_google_token(access_token: str) -> dict:
    """
    Verify a Google OAuth2 access token and return user info.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    data = response.json()

    if not data.get("email"):
        raise HTTPException(status_code=401, detail="Could not get email from Google")

    return {
        "email": data["email"],
        "name": data.get("name", ""),
        "picture": data.get("picture"),
        "sub": data.get("sub", ""),
        "email_verified": data.get("email_verified", False),
    }
