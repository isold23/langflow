from datetime import datetime
from typing import List
from uuid import UUID

import os
import orjson
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Form
from fastapi.encoders import jsonable_encoder
from loguru import logger
from sqlmodel import Session, select

from langflow.api.utils import remove_api_keys, validate_is_component
from langflow.api.v1.schemas import DatasetListCreate, DatasetListRead
from langflow.initial_setup.setup import STARTER_FOLDER_NAME
from langflow.services.auth.utils import get_current_active_user
from langflow.services.database.models.dataset import Dataset, DatasetCreate, DatasetRead, DatasetUpdate
from langflow.services.database.models.user.model import User
from langflow.services.database.models.knowledge import Knowledge;
from langflow.services.deps import get_session, get_settings_service
from langflow.services.settings.service import SettingsService

# build router
router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.post("/", response_model=DatasetRead, status_code=201)
def create_dataset(
    *,
    session: Session = Depends(get_session),
    dataset: DatasetCreate,
    current_user: User = Depends(get_current_active_user),
):
    print("create_dataset *************************")
    if dataset.user_id is None:
        dataset.user_id = current_user.id
        dataset.usergroup = current_user.usergroup
    print(dataset)
    db_dataset = Dataset.model_validate(dataset, from_attributes=True)
    db_dataset.updated_at = datetime.utcnow()
    print("----------------------------")
    print(db_dataset)
    session.add(db_dataset)
    session.commit()
    session.refresh(db_dataset)
    return db_dataset


@router.get("/", response_model=list[DatasetRead], status_code=200)
def read_datasets(
    *,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
    settings_service: "SettingsService" = Depends(get_settings_service),
):
    """Read all datasets."""
    print("read_datasets *************************")
    try:
        auth_settings = settings_service.auth_settings
        if auth_settings.AUTO_LOGIN:
            if current_user.userrole == 2:
                datasets = session.exec(
                    select(Dataset).where(
                        (Dataset.user_id == None) | (Dataset.usergroup == current_user.usergroup)  # noqa
                    )
                ).all()
            else:
                datasets = session.exec(
                    select(Dataset).where(
                        (Dataset.user_id == None) | (Dataset.user_id == current_user.id)  # noqa
                    )
                ).all()
        else:
            #datasets = current_user.datasets
            if current_user.userrole == 2:
                datasets = session.exec(
                    select(Dataset).where(
                        (Dataset.user_id == None) | (Dataset.usergroup == current_user.usergroup)  # noqa
                    )
                ).all()
            else:
                datasets = session.exec(
                    select(Dataset).where(
                        (Dataset.user_id == None) | (Dataset.user_id == current_user.id)  # noqa
                    )
                ).all()

        datasets = validate_is_component(datasets)  # type: ignore
        dataset_ids = [dataset.id for dataset in datasets]
        # with the session get the datasets that DO NOT have a user_id
        try:
            example_datasets = session.exec(
                select(Dataset).where(
                    Dataset.user_id == None,  # noqa
                    Dataset.folder == STARTER_FOLDER_NAME,
                )
            ).all()
            for example_dataset in example_datasets:
                if example_dataset.id not in dataset_ids:
                    datasets.append(example_dataset)  # type: ignore
        except Exception as e:
            logger.error(e)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return [jsonable_encoder(dataset) for dataset in datasets]


@router.get("/{dataset_id}", response_model=DatasetRead, status_code=200)
def read_dataset(
    *,
    session: Session = Depends(get_session),
    dataset_id: UUID,
    current_user: User = Depends(get_current_active_user),
    settings_service: "SettingsService" = Depends(get_settings_service),
):
    """Read a dataset."""
    print("read_dataset *************************")
    auth_settings = settings_service.auth_settings
    stmt = select(Dataset).where(Dataset.id == dataset_id)
    if auth_settings.AUTO_LOGIN:
        # If auto login is enable user_id can be current_user.id or None
        # so write an OR
        stmt = stmt.where(
            (Dataset.user_id == current_user.id) | (Dataset.user_id == None)  # noqa
        )  # noqa
    if user_dataset := session.exec(stmt).first():
        return user_dataset
    else:
        raise HTTPException(status_code=404, detail="Dataset not found")


@router.patch("/{dataset_id}", response_model=DatasetRead, status_code=200)
def update_dataset(
    *,
    session: Session = Depends(get_session),
    dataset_id: UUID,
    dataset: DatasetUpdate,
    current_user: User = Depends(get_current_active_user),
    settings_service=Depends(get_settings_service),
):
    """Update a dataset."""
    print("update_dataset *************************")
    db_dataset = read_dataset(
        session=session,
        dataset_id=dataset_id,
        current_user=current_user,
        settings_service=settings_service,
    )
    if not db_dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    dataset_data = dataset.model_dump(exclude_unset=True)
    if settings_service.settings.REMOVE_API_KEYS:
        dataset_data = remove_api_keys(dataset_data)
    for key, value in dataset_data.items():
        if value is not None:
            setattr(db_dataset, key, value)
    db_dataset.updated_at = datetime.utcnow()
    session.add(db_dataset)
    session.commit()
    session.refresh(db_dataset)
    return db_dataset


@router.delete("/{dataset_id}", status_code=200)
def delete_dataset(
    *,
    session: Session = Depends(get_session),
    dataset_id: UUID,
    current_user: User = Depends(get_current_active_user),
    settings_service=Depends(get_settings_service),
):
    """Delete a dataset."""
    print("delete_dataset *************************")
    dataset = read_dataset(
        session=session,
        dataset_id=dataset_id,
        current_user=current_user,
        settings_service=settings_service,
    )
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    session.delete(dataset)
    session.commit()
    return {"message": "Dataset deleted successfully"}


@router.post("/batch/", response_model=List[DatasetRead], status_code=201)
def create_datasets(
    *,
    session: Session = Depends(get_session),
    dataset_list: DatasetListCreate,
    current_user: User = Depends(get_current_active_user),
):
    """Create multiple new datasets."""
    print("create_datasets *************************")
    db_datasets = []
    for dataset in dataset_list.datasets:
        dataset.user_id = current_user.id
        db_dataset = Dataset.model_validate(dataset, from_attributes=True)
        session.add(db_dataset)
        db_datasets.append(db_dataset)
    session.commit()
    for db_dataset in db_datasets:
        session.refresh(db_dataset)
    return db_datasets


@router.post("/upload/", status_code=200)
async def upload_file(
    *,
    session: Session = Depends(get_session),
    userid: str = Form(...),
    knowledgeid: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    print("dataset upload_file userid: ", userid, "knowledgeid: ", knowledgeid, "file: ", file)

    content = await file.read()
    folder_path = "./metafile/" + userid +  "/" +  knowledgeid + "/"
    try:
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
            print(f"create folder: {folder_path}")
        file_path = folder_path + "/" + file.filename
    
        with open(file_path, 'wb') as file:
            file.write(content)
        print(f"save file: {file_path}")
    except Exception as e:
        print(f"save file failed: {e}")

    return {"message": "File uploaded successfully."}
    """
    contents = await file.read()

    data = orjson.loads(contents)
    if "datasets" in data:
        dataset_list = DatasetListCreate(**data)
    else:
        dataset_list = DatasetListCreate(datasets=[DatasetCreate(**dataset) for dataset in data])
    for dataset in dataset_list.datasets:
        dataset.user_id = current_user.id

    return create_datasets(session=session, dataset_list=dataset_list, current_user=current_user)
    """
"""
@router.get("/download/", response_model=DatasetListRead, status_code=200)
async def download_file(
    *,
    session: Session = Depends(get_session),
    settings_service: "SettingsService" = Depends(get_settings_service),
    current_user: User = Depends(get_current_active_user),
    current_knowledge: Knowledge = Depends(get_current_active_kenowledge),
):
    print("download_file *************************")
    datasets = read_datasets(current_user=current_user, session=session, settings_service=settings_service)
    return DatasetListRead(datasets=datasets)
"""