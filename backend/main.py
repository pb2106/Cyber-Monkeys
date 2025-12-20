"""
Prüfen - Privacy-Preserving Attribute Verification Platform
FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
import models
from database import engine, Base
from routers import (
    auth_router,
    proof_requests_router,
    proofs_router,
    admin_router
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Prüfen API",
    description="Privacy-preserving attribute verification platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router.router)
app.include_router(proof_requests_router.router)
app.include_router(proofs_router.router)
app.include_router(admin_router.router)


@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "name": "Prüfen API",
        "version": "1.0.0",
        "description": "Privacy-preserving attribute verification",
        "documentation": "/docs",
        "privacy_guarantee": "We never store your raw personal data. Only YES/NO proofs."
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/.well-known/jwks.json")
async def jwks():
    """
    JSON Web Key Set endpoint for verifiers to fetch public key.
    """
    import crypto_utils
    from cryptography.hazmat.primitives import serialization
    import base64
    
    public_key = crypto_utils.load_public_key()
    
    # Get public numbers for JWK format
    public_numbers = public_key.public_numbers()
    
    # Convert to base64url encoding
    def int_to_base64url(num):
        bytes_length = (num.bit_length() + 7) // 8
        num_bytes = num.to_bytes(bytes_length, byteorder='big')
        return base64.urlsafe_b64encode(num_bytes).rstrip(b'=').decode('utf-8')
    
    n = int_to_base64url(public_numbers.n)
    e = int_to_base64url(public_numbers.e)
    
    return {
        "keys": [
            {
                "kty": "RSA",
                "kid": "prufen-2024-01",
                "use": "sig",
                "alg": "RS256",
                "n": n,
                "e": e
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    import socket
    
    # Get local IP address
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        local_ip = s.getsockname()[0]
    except:
        local_ip = '127.0.0.1'
    finally:
        s.close()
    
    print("🚀 Starting Prüfen API server...")
    print(f"📚 Local: http://localhost:8000/docs")
    print(f"📱 Network: http://{local_ip}:8000/docs")
    print("🔐 Privacy-preserving verification enabled")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # Listen on all interfaces for network access
        port=8000,
        reload=True
    )
