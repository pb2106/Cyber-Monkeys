"""
Admin endpoints for monitoring and audit.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
from database import get_db

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/proofs")
async def list_proofs(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    List all proofs with metadata (admin only).
    """
    proofs = db.query(models.Proof).order_by(
        models.Proof.created_at.desc()
    ).limit(limit).all()
    
    result = []
    for proof in proofs:
        result.append({
            "proof_id": proof.proof_id,
            "claim_type": proof.claim_type,
            "result": proof.result,
            "access_count": proof.access_count,
            "max_access": proof.max_access,
            "expires_at": proof.expires_at.isoformat(),
            "created_at": proof.created_at.isoformat(),
            "accessed_at": proof.accessed_at.isoformat() if proof.accessed_at else None,
            "deleted": proof.deleted
        })
    
    return {
        "total": len(result),
        "proofs": result
    }


@router.get("/audit-log")
async def get_audit_log(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get audit log entries (admin only).
    """
    logs = db.query(models.AuditLog).order_by(
        models.AuditLog.timestamp.desc()
    ).limit(limit).all()
    
    result = []
    for log in logs:
        result.append({
            "log_id": log.log_id,
            "proof_id": log.proof_id,
            "action": log.action,
            "timestamp": log.timestamp.isoformat(),
            "extra_data": log.extra_data
        })
    
    return {
        "total": len(result),
        "logs": result
    }


@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """
    Get platform statistics.
    """
    total_proofs = db.query(models.Proof).count()
    total_requests = db.query(models.ProofRequest).count()
    total_users = db.query(models.MockUser).count()
    total_verifiers = db.query(models.Verifier).filter_by(active=True).count()
    
    # Proofs by claim type
    proofs_by_claim = db.query(
        models.Proof.claim_type,
        models.Proof.result
    ).all()
    
    claim_stats = {}
    for claim_type, result in proofs_by_claim:
        if claim_type not in claim_stats:
            claim_stats[claim_type] = {"approved": 0, "denied": 0}
        
        if result:
            claim_stats[claim_type]["approved"] += 1
        else:
            claim_stats[claim_type]["denied"] += 1
    
    return {
        "total_proofs": total_proofs,
        "total_requests": total_requests,
        "total_users": total_users,
        "total_verifiers": total_verifiers,
        "proofs_by_claim": claim_stats
    }
