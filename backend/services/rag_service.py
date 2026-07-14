from pathlib import Path
from typing import List, Tuple

from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
# from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader


EMBEDDINGS_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
KB_PATH = DATA_DIR / "knowledge_base"
INDEX_PATH = DATA_DIR / "faiss_index"

_embeddings = None
_vectorstore = None


def get_embeddings():
    """
    Load the embedding model once and reuse it.

    Embeddings convert text into vectors so FAISS can search for
    clinically relevant guideline chunks.
    """

    global _embeddings

    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDINGS_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )

    return _embeddings


def build_faiss_index():
    """
    Build a FAISS vector index from .txt files inside data/knowledge_base.
    """

    KB_PATH.mkdir(parents=True, exist_ok=True)

    loader = DirectoryLoader(
        str(KB_PATH),
        glob="**/*.txt",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"},
    )

    documents = loader.load()

    if not documents:
        raise RuntimeError(
            f"No knowledge base .txt files found in: {KB_PATH}"
        )

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=80,
        separators=["\n\n", "\n", ". ", " "],
    )

    chunks = splitter.split_documents(documents)

    print(f"Loaded {len(documents)} documents.")
    print(f"Created {len(chunks)} text chunks.")
    print("Building FAISS index...")

    vectorstore = FAISS.from_documents(
        chunks,
        get_embeddings(),
    )

    vectorstore.save_local(str(INDEX_PATH))

    print(f"FAISS index saved to: {INDEX_PATH}")

    return vectorstore


def get_vectorstore():
    """
    Load the FAISS index if it exists.
    If it does not exist, build it.
    """

    global _vectorstore

    if _vectorstore is None:
        if not INDEX_PATH.exists():
            print("FAISS index not found. Building index now...")
            _vectorstore = build_faiss_index()
        else:
            print("Loading existing FAISS index...")
            _vectorstore = FAISS.load_local(
                str(INDEX_PATH),
                get_embeddings(),
                allow_dangerous_deserialization=True,
            )

    return _vectorstore


def retrieve_clinical_evidence(
    query: str,
    k: int = 4,
) -> List[Tuple[str, str, float]]:
    """
    Retrieve the top-k most relevant clinical guideline chunks.

    Returns:
    [
        (source_name, content, relevance_score),
        ...
    ]
    """

    vectorstore = get_vectorstore()

    results = vectorstore.similarity_search_with_relevance_scores(
        query,
        k=k,
    )

    evidence = []

    for document, score in results:
        source_path = document.metadata.get("source", "Clinical Guidelines")
        source_name = Path(source_path).stem.replace("_", " ").title()

        evidence.append(
            (
                source_name,
                document.page_content,
                float(score),
            )
        )

    return evidence