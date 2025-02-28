from models.models import (
    Document,
    Message,
    ConnectorId,
    ConnectorStatus,
    AuthorizationResult,
    Connection,
    ConnectionFilter,
    Settings,
    SectionFilter
)
from pydantic import BaseModel
from typing import List, Optional, Dict

class GetLinkSettingsResponse(BaseModel):
    settings: Optional[Settings]
    
class ConnectorStatusResponse(BaseModel):
    status: ConnectorStatus

class ConnectorStatusRequest(BaseModel):
    connector_id: ConnectorId

class GetConnectionsRequest(BaseModel):
    filter: ConnectionFilter

class GetConnectionsResponse(BaseModel):
    connections: List[Connection]

class EnableConnectorRequest(BaseModel):
    connector_id: ConnectorId
    credential: Dict

class AuthorizeOauthRequest(BaseModel):
    connector_id: ConnectorId
    account_id: str
    auth_code: Optional[str]
    metadata: Optional[Dict]

class AuthorizeApiKeyRequest(BaseModel):
    connector_id: ConnectorId
    account_id: str
    credential: Dict
    metadata: Optional[Dict]


class AuthorizationResponse(BaseModel):
    result: AuthorizationResult

class GetDocumentsRequest(BaseModel):
    connector_id: Optional[ConnectorId]
    section_filter: Optional[str]
    uris: Optional[List[str]]
    account_id: str
    chunked: Optional[bool] = False
    min_chunk_size: Optional[int] = 500
    max_chunk_size: Optional[int] = 1500


class GetDocumentsResponse(BaseModel):
    documents: List[Document]

class GetConversationsRequest(BaseModel):
    connector_id: ConnectorId
    account_id: str
    oldest_timestamp: Optional[str] = None

class GetConversationsResponse(BaseModel):
    messages: List[Message]

class RunSyncRequest(BaseModel):
    sync_all: bool

class RunSyncResponse(BaseModel):
    success: List[bool]

class AskQuestionRequest(BaseModel):
    question: str
    connector_ids: Optional[List[ConnectorId]]
    account_id: str
    openai_api_key: str

class AskQuestionResponse(BaseModel):
    answer: str
    sources: List[str]

class AddSectionFilterRequest(BaseModel):
    connector_id: ConnectorId
    account_id: str
    section_filter: SectionFilter

class AddSectionFilterResponse(BaseModel):
    success: bool
    section_filter: Optional[SectionFilter]

class UpdateConnectionMetadataResponse(BaseModel):
    success: bool

class UpdateConnectionMetadataRequest(BaseModel):
    connector_id: ConnectorId
    account_id: str
    metadata: Dict
