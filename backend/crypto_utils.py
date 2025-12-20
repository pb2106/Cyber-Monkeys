"""
Cryptographic utilities for Prüfen proof generation and verification.
"""
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
import os
import secrets
import hashlib


def generate_rsa_keypair(private_key_path: str = "keys/private_key.pem",
                         public_key_path: str = "keys/public_key.pem"):
    """
    Generate RSA-2048 key pair for JWT signing.
    Saves keys to specified paths.
    """
    # Create keys directory if it doesn't exist
    os.makedirs(os.path.dirname(private_key_path), exist_ok=True)

    # Generate private key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )

    # Serialize private key
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    # Serialize public key
    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    # Write to files
    with open(private_key_path, "wb") as f:
        f.write(private_pem)

    with open(public_key_path, "wb") as f:
        f.write(public_pem)

    print(f"✓ RSA key pair generated:")
    print(f"  Private key: {private_key_path}")
    print(f"  Public key:  {public_key_path}")


def load_private_key(path: str = "keys/private_key.pem"):
    """Load private key from PEM file."""
    with open(path, "rb") as f:
        return serialization.load_pem_private_key(
            f.read(),
            password=None,
            backend=default_backend()
        )


def load_public_key(path: str = "keys/public_key.pem"):
    """Load public key from PEM file."""
    with open(path, "rb") as f:
        return serialization.load_pem_public_key(
            f.read(),
            backend=default_backend()
        )


def generate_nonce(length: int = 32) -> str:
    """Generate cryptographically secure random nonce."""
    return secrets.token_hex(length)


def generate_salt(length: int = 16) -> str:
    """Generate random salt for verifier binding."""
    return secrets.token_hex(length)


def compute_verifier_hash(api_key: str, salt: str) -> str:
    """
    Compute SHA-256 hash of verifier API key + salt.
    This binds the proof to a specific verifier.
    """
    return hashlib.sha256((api_key + salt).encode()).hexdigest()


def generate_api_key() -> str:
    """Generate secure API key for verifiers."""
    return f"pk_{secrets.token_urlsafe(32)}"


# Initialize keys on module import if they don't exist
if not os.path.exists("keys/private_key.pem"):
    print("🔐 Generating RSA key pair for first-time setup...")
    generate_rsa_keypair()
