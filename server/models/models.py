from pydantic import BaseModel
from abc import ABC, abstractmethod
from typing import List, Optional, Dict
from enum import Enum



class ConnectorId(str, Enum):
    notion = "notion"
    gdrive = "gdrive"
    zendesk = "zendesk"
    confluence = "confluence"
    slack = "slack"
    dropbox = "dropbox"
    intercom = "intercom"
    hubspot = "hubspot"
    readme = "readme"
    salesforce = "salesforce"

class Settings(BaseModel):
    name: str
    logo: Optional[str]
    whitelabel: bool
    custom_auth_url: Optional[str]
    enabled_connectors: List[ConnectorId]

class AppConfig(BaseModel):
    app_id: str
    user_id: str


class SectionType(str, Enum):
    folder = "folder"
    document = "document"

class Section(BaseModel):
    id: str
    name: str
    type: SectionType
    children: Optional[List["Section"]] = None

class SectionFilter(BaseModel):
    id: str
    sections: List[Section]

class Connection(BaseModel):
    account_id: str
    connector_id: ConnectorId
    metadata: Dict
    section_filters: Optional[List[SectionFilter]] = []
    sections: Optional[List[Section]] = None
    credential: Optional[str]
    config: Optional[AppConfig]
    
class ConnectorStatus(BaseModel):
    is_enabled: bool
    custom_credentials: Optional[Dict]
    connections: List[Connection] = []

class Document(BaseModel):
    title: str
    content: str
    connector_id: ConnectorId
    account_id: str
    uri: Optional[str] = None

class MessageSender(BaseModel):
    name: str
    id: str

class MessageChannel(BaseModel):
    name: str
    id: str

class Message(BaseModel):
    id: str
    channel: MessageChannel
    sender: MessageSender
    content: str
    timestamp: str
    replies: List["Message"] = []
    uri: Optional[str] = None

Message.update_forward_refs()

class AuthorizationResult(BaseModel):
    auth_url: Optional[str] = None
    authorized: bool = False
    connection: Optional[Connection] = None

class DataConnector(BaseModel, ABC):
    connector_id: ConnectorId

    @abstractmethod
    async def authorize(self, *args, **kwargs) -> AuthorizationResult:
        pass

    @abstractmethod
    async def authorize_api_key(self, *args, **kwargs) -> AuthorizationResult:
        pass

    @abstractmethod
    async def get_sections(self, *args, **kwargs) -> List[Section]:
        pass

class DocumentConnector(DataConnector):
    @abstractmethod
    async def load(self, account_id: str, uris: Optional[List[str]], section_filter: Optional[str]) -> List[Document]:
        pass

class ConversationConnector(DataConnector):
    @abstractmethod
    async def load(self, account_id: str, oldest_message_time: Optional[str]) -> List[Message]:
        pass

class ConnectionFilter(BaseModel):
    connector_id: Optional[ConnectorId] = None
    account_id: str
    uris: Optional[List[str]] = None
    section_filter_id: Optional[str] = None

class Sync(BaseModel):
    app_id: str
    webhook_url: str

class SyncResult(BaseModel):
    account_id: str
    connector_id: str
    success: bool
    docs_synced: int
    error: str = ""

class SyncResults(BaseModel):
    last_updated: int
    results: List[SyncResult] = []

class AskQuestionResult(BaseModel):
    answer: str
    sources: List[str]

