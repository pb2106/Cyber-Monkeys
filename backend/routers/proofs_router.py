"""
Proof delivery and verification endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from jose import jwt, JWTError
import models
import crypto_utils
from database import get_db

router = APIRouter(prefix="/api/proofs", tags=["Proofs"])


@router.get("/{proof_id}")
async def fetch_proof(
    proof_id: str,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Verifier fetches proof.
    Validates verifier binding, expiration, and single-use constraint.
    """
    # Validate verifier
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key"
        )
    
    api_key = authorization.replace("Bearer ", "")
    verifier = db.query(models.Verifier).filter_by(api_key=api_key).first()
    
    if not verifier or not verifier.active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    # Fetch proof
    proof = db.query(models.Proof).filter_by(
        proof_id=proof_id,
        deleted=False
    ).first()
    
    if not proof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proof not found"
        )
    
    # Check expiration
    if datetime.utcnow() > proof.expires_at:
        # Mark as expired and log
        audit = models.AuditLog(
            proof_id=proof_id,
            action="expired",
            extra_data="Proof accessed after expiration"
        )
        db.add(audit)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Proof expired"
        )
    
    # Validate verifier binding
    # Extract salt from JWT to recompute hash
    try:
        payload = jwt.decode(
            proof.jwt_token,
            options={"verify_signature": False}  # We'll verify signature separately
        )
        salt = payload.get("salt")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid proof token"
        )
    
    expected_hash = crypto_utils.compute_verifier_hash(api_key, salt)
    
    if proof.verifier_hash != expected_hash:
        # Audit unauthorized access attempt
        audit = models.AuditLog(
            proof_id=proof_id,
            action="unauthorized_access_attempt",
            extra_data=f"Verifier {verifier.company_name} attempted to access proof bound to different verifier"
        )
        db.add(audit)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Proof not bound to this verifier"
        )
    
    # Check single-use constraint
    if proof.access_count >= proof.max_access:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Proof already consumed"
        )
    
    # Increment access counter
    proof.access_count += 1
    proof.accessed_at = datetime.utcnow()
    
    # Audit log
    audit = models.AuditLog(
        proof_id=proof_id,
        action="accessed",
        extra_data=f"Accessed by {verifier.company_name}"
    )
    
    db.add(audit)
    db.commit()
    
    # Return proof (verifier receives YES/NO only)
    return {
        "proof_id": proof.proof_id,
        "claim_type": proof.claim_type,
        "result": proof.result,  # YES or NO
        "expires_at": proof.expires_at.isoformat(),
        "signature": proof.jwt_token,
        "public_key_url": "http://localhost:8000/api/public-key",
        "access_count": proof.access_count,
        "max_access": proof.max_access,
        "privacy_guarantee": "This proof contains NO personal data. Only YES/NO result."
    }


class VerifyProofRequest(BaseModel):
    jwt_token: str


@router.post("/verify")
async def verify_proof_signature(request: VerifyProofRequest):
    """
    Verify JWT signature of a proof.
    Anyone can verify the cryptographic validity.
    """
    try:
        # Load public key
        public_key = crypto_utils.load_public_key()
        
        # Verify signature
        payload = jwt.decode(
            request.jwt_token,
            public_key,
            algorithms=["RS256"]
        )
        
        return {
            "valid": True,
            "payload": payload,
            "message": "Signature verified successfully"
        }
    
    except JWTError as e:
        return {
            "valid": False,
            "error": str(e),
            "message": "Signature verification failed"
        }


@router.get("/public-key", response_class=PlainTextResponse)
async def get_public_key():
    """
    Serve public key for proof verification.
    """
    public_key = crypto_utils.load_public_key()
    
    # Convert to PEM format
    from cryptography.hazmat.primitives import serialization
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    return public_pem.decode('utf-8')
