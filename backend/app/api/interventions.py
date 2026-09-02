from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from ..database.database import get_db
from ..database.models import Intervention, User
from .auth import get_current_user, require_role

router = APIRouter()

class InterventionCreate(BaseModel):
    project_code: str
    warning_reference: Optional[int] = None
    ministry: Optional[str] = None
    assigned_to_user_id: Optional[int] = None
    priority: str = "MODERATE"
    recommended_review_area: Optional[str] = None
    evidence_summary: Optional[str] = None
    due_date: Optional[str] = None

class InterventionUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to_user_id: Optional[int] = None
    engineer_response_note: Optional[str] = None

class InterventionResponse(BaseModel):
    intervention_id: int
    project_code: str
    warning_reference: Optional[int] = None
    ministry: Optional[str] = None
    assigned_to_user_id: Optional[int] = None
    created_by: int
    status: str
    priority: str
    recommended_review_area: Optional[str] = None
    evidence_summary: Optional[str] = None
    engineer_response_note: Optional[str] = None
    due_date: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[InterventionResponse])
async def get_interventions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ENGINEER"])),
    status: Optional[str] = Query(None)
):
    query = db.query(Intervention)
    if current_user.role == "ENGINEER":
        query = query.filter(Intervention.ministry == current_user.ministry)
        
    if status:
        query = query.filter(Intervention.status == status.upper())
        
    return query.all()

@router.post("/", response_model=InterventionResponse)
async def create_intervention(
    intervention: InterventionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    db_intervention = Intervention(
        project_code=intervention.project_code,
        warning_reference=intervention.warning_reference,
        ministry=intervention.ministry,
        assigned_to_user_id=intervention.assigned_to_user_id,
        created_by=current_user.id,
        priority=intervention.priority,
        recommended_review_area=intervention.recommended_review_area,
        evidence_summary=intervention.evidence_summary,
        due_date=intervention.due_date
    )
    db.add(db_intervention)
    db.commit()
    db.refresh(db_intervention)
    return db_intervention

@router.patch("/{intervention_id}", response_model=InterventionResponse)
async def update_intervention(
    intervention_id: int,
    intervention_update: InterventionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ENGINEER"]))
):
    db_intervention = db.query(Intervention).filter(Intervention.intervention_id == intervention_id).first()
    if not db_intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")
        
    if current_user.role == "ENGINEER" and db_intervention.ministry != current_user.ministry:
        raise HTTPException(status_code=403, detail="Not authorized to update this ministry's intervention")
        
    # Apply updates
    update_data = intervention_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        # Engineers cannot reassign interventions
        if current_user.role == "ENGINEER" and key == "assigned_to_user_id":
            continue
        setattr(db_intervention, key, value)
        
    # Check if resolved or closed
    if db_intervention.status in ["RESOLVED", "CLOSED"] and not db_intervention.resolved_at:
        db_intervention.resolved_at = datetime.utcnow()
        
    db.commit()
    db.refresh(db_intervention)
    return db_intervention
