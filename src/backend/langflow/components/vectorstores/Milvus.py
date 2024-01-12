from typing import Optional, List
from langflow import CustomComponent

from langchain_community.vectorstores import Milvus
from langchain.schema import Document
from langchain.vectorstores.base import VectorStore
from langchain.embeddings.base import Embeddings


class MilvusComponent(CustomComponent):
    """
    A custom component for implementing a Vector Store using Milvus.
    """

    display_name: str = "Milvus"
    description: str = "Implementation of Vector Store using Milvus"
    documentation = "https://python.langchain.com/docs/integrations/vectorstores/milvus"
    beta = True

    def build_config(self):
        """
        Builds the configuration for the component.

        Returns:
        - dict: A dictionary containing the configuration options for the component.
        """
        return {
            "index_name": {"display_name": "Index Name", "value": "your_index"},
            "code": {"show": True, "display_name": "Code"},
            "documents": {"display_name": "Documents", "is_list": True},
            "embedding": {"display_name": "Embedding"},
            "collection_name": {"display_name": "Collection Name", "value": "langflow"},
        }

    def build(
        self,
        embedding: Embeddings,
        collection_name: str,
        documents: Optional[List[Document]] = None,
    ) -> VectorStore:
        """
        Builds the Vector Store or BaseRetriever object.

        Args:
        - embedding (Embeddings): The embeddings to use for the Vector Store.
        - documents (Optional[Document]): The documents to use for the Vector Store.
        - collection_name (str): The name of the PG table.

        Returns:
        - VectorStore: The Vector Store object.
        """

        try:
            if documents is None:
                return Milvus.from_existing_index(
                    embedding=embedding,
                    collection_name=collection_name,
                )

            return Milvus.from_documents(
                embedding=embedding,
                documents=documents,
                collection_name=collection_name,
            )
        except Exception as e:
            raise RuntimeError(f"Failed to build Milvus: {e}")
