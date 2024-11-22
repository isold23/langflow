import os
from langchain.document_loaders import PyPDFLoader, Docx2txtLoader
import fitz
from docx import Document
from langchain_community.vectorstores.faiss import FAISS
import numpy as np
import torch
from transformers import BertTokenizer, BertModel

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

def read_pdf(file_path):
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def read_docx(file_path):
    doc = Document(file_path)
    return "\n".join([p.text for p in doc.paragraphs])

def read_file(file_path):
    ext = os.path.splitext(file_path)[-1].lower()

    if ext == '.txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    elif ext == '.pdf':
        return read_pdf(file_path)
    elif ext == '.docx':
        return read_docx(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")

def embed_document(doc_text):
    inputs = tokenizer(doc_text, return_tensors='pt', padding=True, truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :].numpy()
    
def create_faiss_index(doc_embeddings):
    d = doc_embeddings.shape[1]
    index = FAISS.IndexFlatL2(d)
    index.add(doc_embeddings)
    return index
    
def save_faiss_index(index, file_path):
    FAISS.write_index(index, file_path)
    print(f"Faiss index save {file_path}")

def load_faiss_index(file_path):
    index = FAISS.read_index(file_path)
    print(f"Faiss index load from {file_path} ")
    return index

def make_faiss_embedding(file_paths):
    embeddings = []
    for file_path in file_paths:
        text = read_file(file_path)
        embedding = embed_document(text)
        embeddings.append(embedding)

    doc_embeddings = np.vstack(embeddings)

    index = create_faiss_index(doc_embeddings)
    faiss_index_file = '/Users/liwei/pri/venv/langflow/metafile/faiss_index.index'
    save_faiss_index(index, faiss_index_file)
    return

def make_faiss_embedding1(file_paths):
    

