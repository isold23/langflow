from datetime import datetime
from typing import List
from uuid import UUID

import orjson
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.encoders import jsonable_encoder
from loguru import logger
from sqlmodel import Session, select

from langflow.api.utils import remove_api_keys, validate_is_component
from langflow.api.v1.schemas import KnowledgeListCreate, KnowledgeListRead
from langflow.initial_setup.setup import STARTER_FOLDER_NAME
from langflow.services.auth.utils import get_current_active_user
from langflow.services.database.models.knowledge import Knowledge, KnowledgeCreate, KnowledgeRead, KnowledgeUpdate
from langflow.services.database.models.user.model import User
from langflow.services.deps import get_session, get_settings_service
from langflow.services.settings.service import SettingsService

# build router
router = APIRouter(prefix="/knowledges", tags=["Knowledges"])


@router.post("/", response_model=KnowledgeRead, status_code=201)
def create_knowledge(
    *,
    session: Session = Depends(get_session),
    knowledge: KnowledgeCreate,
    current_user: User = Depends(get_current_active_user),
):
    """Create a new knowledge."""
    if knowledge.user_id is None:
        knowledge.user_id = current_user.id
        knowledge.usergroup = current_user.usergroup

    db_knowledge = Knowledge.model_validate(knowledge, from_attributes=True)
    db_knowledge.updated_at = datetime.utcnow()

    session.add(db_knowledge)
    session.commit()
    session.refresh(db_knowledge)
    return db_knowledge


@router.get("/", response_model=list[KnowledgeRead], status_code=200)
def read_knowledges(
    *,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
    settings_service: "SettingsService" = Depends(get_settings_service),
):
    """Read all knowledges."""
    try:
        auth_settings = settings_service.auth_settings
        if auth_settings.AUTO_LOGIN:
            if current_user.userrole == 2:
                knowledges = session.exec(
                    select(Knowledge).where(
                        (Knowledge.user_id == None) | (Knowledge.usergroup == current_user.usergroup)  # noqa
                    )
                ).all()
            else:
                knowledges = session.exec(
                    select(Knowledge).where(
                        (Knowledge.user_id == None) | (Knowledge.user_id == current_user.id)  # noqa
                    )
                ).all()
        else:
            #knowledges = current_user.knowledges
            if current_user.userrole == 2:
                knowledges = session.exec(
                    select(Knowledge).where(
                        (Knowledge.user_id == None) | (Knowledge.usergroup == current_user.usergroup)  # noqa
                    )
                ).all()
            else:
                knowledges = session.exec(
                    select(Knowledge).where(
                        (Knowledge.user_id == None) | (Knowledge.user_id == current_user.id)  # noqa
                    )
                ).all()

        knowledges = validate_is_component(knowledges)  # type: ignore
        knowledge_ids = [knowledge.id for knowledge in knowledges]
        # with the session get the knowledges that DO NOT have a user_id
        try:
            example_knowledges = session.exec(
                select(Knowledge).where(
                    Knowledge.user_id == None,  # noqa
                    Knowledge.folder == STARTER_FOLDER_NAME,
                )
            ).all()
            for example_knowledge in example_knowledges:
                if example_knowledge.id not in knowledge_ids:
                    knowledges.append(example_knowledge)  # type: ignore
        except Exception as e:
            logger.error(e)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return [jsonable_encoder(knowledge) for knowledge in knowledges]


@router.get("/{knowledge_id}", response_model=KnowledgeRead, status_code=200)
def read_knowledge(
    *,
    session: Session = Depends(get_session),
    knowledge_id: UUID,
    current_user: User = Depends(get_current_active_user),
    settings_service: "SettingsService" = Depends(get_settings_service),
):
    """Read a knowledge."""
    auth_settings = settings_service.auth_settings
    stmt = select(Knowledge).where(Knowledge.id == knowledge_id)
    if auth_settings.AUTO_LOGIN:
        # If auto login is enable user_id can be current_user.id or None
        # so write an OR
        stmt = stmt.where(
            (Knowledge.user_id == current_user.id) | (Knowledge.user_id == None)  # noqa
        )  # noqa
    if user_knowledge := session.exec(stmt).first():
        return user_knowledge
    else:
        raise HTTPException(status_code=404, detail="Knowledge not found")


@router.patch("/{knowledge_id}", response_model=KnowledgeRead, status_code=200)
def update_knowledge(
    *,
    session: Session = Depends(get_session),
    knowledge_id: UUID,
    knowledge: KnowledgeUpdate,
    current_user: User = Depends(get_current_active_user),
    settings_service=Depends(get_settings_service),
):
    """Update a knowledge."""

    db_knowledge = read_knowledge(
        session=session,
        knowledge_id=knowledge_id,
        current_user=current_user,
        settings_service=settings_service,
    )
    if not db_knowledge:
        raise HTTPException(status_code=404, detail="Knowledge not found")
    knowledge_data = knowledge.model_dump(exclude_unset=True)
    if settings_service.settings.REMOVE_API_KEYS:
        knowledge_data = remove_api_keys(knowledge_data)
    for key, value in knowledge_data.items():
        if value is not None:
            setattr(db_knowledge, key, value)
    db_knowledge.updated_at = datetime.utcnow()
    session.add(db_knowledge)
    session.commit()
    session.refresh(db_knowledge)
    return db_knowledge


@router.delete("/{knowledge_id}", status_code=200)
def delete_knowledge(
    *,
    session: Session = Depends(get_session),
    knowledge_id: UUID,
    current_user: User = Depends(get_current_active_user),
    settings_service=Depends(get_settings_service),
):
    """Delete a knowledge."""
    knowledge = read_knowledge(
        session=session,
        knowledge_id=knowledge_id,
        current_user=current_user,
        settings_service=settings_service,
    )
    if not knowledge:
        raise HTTPException(status_code=404, detail="Knowledge not found")
    session.delete(knowledge)
    session.commit()
    return {"message": "Knowledge deleted successfully"}


@router.post("/batch/", response_model=List[KnowledgeRead], status_code=201)
def create_knowledges(
    *,
    session: Session = Depends(get_session),
    knowledge_list: KnowledgeListCreate,
    current_user: User = Depends(get_current_active_user),
):
    """Create multiple new knowledges."""
    db_knowledges = []
    for knowledge in knowledge_list.knowledges:
        knowledge.user_id = current_user.id
        db_knowledge = Knowledge.model_validate(knowledge, from_attributes=True)
        session.add(db_knowledge)
        db_knowledges.append(db_knowledge)
    session.commit()
    for db_knowledge in db_knowledges:
        session.refresh(db_knowledge)
    return db_knowledges


@router.post("/upload/", response_model=List[KnowledgeRead], status_code=201)
async def upload_file(
    *,
    session: Session = Depends(get_session),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """Upload knowledges from a file."""
    contents = await file.read()
    data = orjson.loads(contents)
    if "knowledges" in data:
        knowledge_list = KnowledgeListCreate(**data)
    else:
        knowledge_list = KnowledgeListCreate(knowledges=[KnowledgeCreate(**knowledge) for knowledge in data])
    # Now we set the user_id for all knowledges
    for knowledge in knowledge_list.knowledges:
        knowledge.user_id = current_user.id

    return create_knowledges(session=session, knowledge_list=knowledge_list, current_user=current_user)


@router.get("/download/", response_model=KnowledgeListRead, status_code=200)
async def download_file(
    *,
    session: Session = Depends(get_session),
    settings_service: "SettingsService" = Depends(get_settings_service),
    current_user: User = Depends(get_current_active_user),
):
    """Download all knowledges as a file."""
    knowledges = read_knowledges(current_user=current_user, session=session, settings_service=settings_service)
    return KnowledgeListRead(knowledges=knowledges)
