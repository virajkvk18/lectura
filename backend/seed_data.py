Action: file_editor create /app/backend/seed_data.py --file-text "\"\"\"Seed sample lectures with transcripts. Idempotent - only inserts if collection empty.\"\"\"
from datetime import datetime, timezone
from typing import List
from models import Lecture, Chapter, TranscriptSegment


# Public sample MP4s (Google's commondatastorage demos)
_SAMPLES = [
    {
        \"id\": \"lec-neural-nets\",
        \"title\": \"Neural Networks: From Perceptrons to Transformers\",
        \"description\": \"A foundational tour of neural networks - what they are, how they learn, and why transformers changed everything.\",
        \"instructor\": \"Dr. Maya Chen\",
        \"duration\": 596.0,
        \"thumbnail\": \"https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80\",
        \"video_url\": \"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4\",
        \"tags\": [\"AI\", \"Deep Learning\", \"Foundations\"],
        \"chapters\": [
            {\"title\": \"What is a neuron?\", \"start\": 0, \"end\": 90},
            {\"title\": \"Forward & backward pass\", \"start\": 90, \"end\": 220},
            {\"title\": \"Activation functions\", \"start\": 220, \"end\": 340},
            {\"title\": \"From RNNs to Transformers\", \"start\": 340, \"end\": 480},
            {\"title\": \"Attention is all you need\", \"start\": 480, \"end\": 596},
        ],
        \"segments\": [
            (0, 12, \"Welcome to neural networks. Today we will build intuition from the perceptron all the way to the transformer architecture that powers modern AI.\"),
            (12, 28, \"A neuron is a simple computational unit. It takes inputs, multiplies them by weights, adds a bias, and applies an activation function to produce an output.\"),
            (28, 48, \"Stacking neurons in layers gives us a feed-forward network. Each layer transforms its input and passes it forward to the next layer.\"),
            (48, 70, \"Training a network means finding weights that minimize a loss function. We measure how wrong the prediction is and nudge weights in the right direction.\"),
            (70, 90, \"Gradient descent is the workhorse of deep learning. It uses the gradient of the loss with respect to the weights to make small improvement steps.\"),
            (90, 115, \"The forward pass computes activations layer by layer. The backward pass uses the chain rule to compute gradients efficiently. This is backpropagation.\"),
            (115, 145, \"Backpropagation reuses intermediate computations. Without it, training deep networks would be intractable. It is one of the most important algorithms in machine learning.\"),
            (145, 175, \"Mini-batch stochastic gradient descent processes a small batch of examples at a time. This makes training fast and adds beneficial noise to the gradient estimate.\"),
            (175, 220, \"Optimizers like Adam adapt the learning rate per parameter. Adam combines momentum with adaptive scaling and is the default choice for most modern networks.\"),
            (220, 250, \"Activation functions add non-linearity. Without them, a deep network would collapse to a single linear transformation, regardless of depth.\"),
            (250, 285, \"ReLU - the rectified linear unit - returns max of zero and x. It is simple, fast, and avoids the vanishing gradient problem of sigmoids and tanh.\"),
            (285, 320, \"GELU and SiLU are smoother variants used in transformers. They produce slightly better gradients near zero and are popular in modern architectures.\"),
            (320, 340, \"Choosing an activation function matters less than choosing a good architecture, but ReLU and its variants are reliable defaults.\"),
            (340, 380, \"Recurrent neural networks process sequences one token at a time, maintaining a hidden state. They are natural for language but suffer from long-range dependency issues.\"),
            (380, 425, \"LSTMs and GRUs use gating to control what information to keep. They were the state of the art in NLP before 2017 but are slow because they cannot be parallelized.\"),
            (425, 480, \"The transformer architecture replaced recurrence with self-attention. Every token attends to every other token in parallel, enabling massive scale.\"),
            (480, 520, \"Self-attention computes a weighted sum of value vectors. The weights come from the dot product of queries and keys, scaled and softmaxed.\"),
            (520, 560, \"Multi-head attention runs several attention operations in parallel. Different heads learn to focus on different relationships in the data.\"),
            (560, 596, \"The transformer is now the foundation of GPT, BERT, and modern multimodal models. Understanding attention is the key to understanding AI today.\"),
        ],
    },
    {
        \"id\": \"lec-rag\",
        \"title\": \"Retrieval Augmented Generation, Explained\",
        \"description\": \"How RAG combines vector search with LLMs to produce factual, citation-backed answers from your own data.\",
        \"instructor\": \"Prof. Arjun Patel\",
        \"duration\": 480.0,
        \"thumbnail\": \"https://images.unsplash.com/photo-1675557009875-436f7a4cf4dc?w=800&q=80\",
        \"video_url\": \"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4\",
        \"tags\": [\"RAG\", \"LLM\", \"Vector Search\"],
        \"chapters\": [
            {\"title\": \"Why RAG?\", \"start\": 0, \"end\": 80},
            {\"title\": \"Embeddings & vector DBs\", \"start\": 80, \"end\": 200},
            {\"title\": \"Chunking strategies\", \"start\": 200, \"end\": 320},
            {\"title\": \"Prompt orchestration\", \"start\": 320, \"end\": 480},
        ],
        \"segments\": [
            (0, 20, \"Large language models are powerful but they hallucinate. They cannot know about your private data, last week's news, or domain-specific knowledge.\"),
            (20, 45, \"Retrieval augmented generation, or RAG, solves this by giving the model relevant context at inference time. The model reads, then writes.\"),
            (45, 80, \"RAG is now the most common pattern for grounded enterprise AI. It is cheaper than fine-tuning and easier to update. New documents simply re-index.\"),
            (80, 115, \"An embedding is a dense vector representation of text. Similar meanings produce similar vectors. We measure similarity with cosine distance.\"),
            (115, 155, \"A vector database indexes these embeddings for fast nearest-neighbor search. Pinecone, Weaviate, and pgvector are popular choices.\"),
            (155, 200, \"At query time, we embed the user question and find the top-k most similar chunks. These chunks become the context for the LLM.\"),
            (200, 240, \"Chunking strategy matters enormously. Too small and you lose context. Too large and you dilute the signal with irrelevant text.\"),
            (240, 280, \"Common strategies are fixed-size chunks with overlap, semantic chunking by sentence boundaries, and hierarchical chunking with summaries.\"),
            (280, 320, \"Choose a chunk size that matches your content. Code might want function-level chunks. Lectures might want timestamp segments of about thirty seconds.\"),
            (320, 360, \"The system prompt frames the task and tells the model how to behave. The retrieved context is injected as evidence the model can cite.\"),
            (360, 400, \"Prompt orchestration also includes the conversation history, the user question, and any tools the model can call. Order and formatting matter.\"),
            (400, 440, \"Citations boost trust. Tell the model to reference sources by id. The frontend can then turn those references into clickable links or timestamps.\"),
            (440, 480, \"Streaming the response token by token makes the experience feel fast. Combined with skeleton loading and typing indicators, it feels like magic.\"),
        ],
    },
    {
        \"id\": \"lec-prompt-eng\",
        \"title\": \"Prompt Engineering for Builders\",
        \"description\": \"Practical patterns - few-shot, chain-of-thought, tool use - that turn raw LLMs into reliable products.\",
        \"instructor\": \"Lena Park\",
        \"duration\": 360.0,
        \"thumbnail\": \"https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80\",
        \"video_url\": \"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4\",
        \"tags\": [\"Prompting\", \"LLM\", \"Patterns\"],
        \"chapters\": [
            {\"title\": \"System vs user prompts\", \"start\": 0, \"end\": 90},
            {\"title\": \"Few-shot examples\", \"start\": 90, \"end\": 180},
            {\"title\": \"Chain of thought\", \"start\": 180, \"end\": 270},
            {\"title\": \"Tool use & function calling\", \"start\": 270, \"end\": 360},
        ],
        \"segments\": [
            (0, 25, \"A prompt is a contract between you and the model. The clearer the contract, the more reliable the output.\"),
            (25, 55, \"System prompts set the role and constraints. User prompts provide the immediate task. Keep them separate and stable.\"),
            (55, 90, \"Good system prompts state the persona, the format, and the things the model must never do. Be specific about output structure.\"),
            (90, 130, \"Few-shot prompting shows the model examples of the input-output mapping. Three to five examples is usually a sweet spot.\"),
            (130, 180, \"Make sure your examples are diverse and cover edge cases. The model will pattern-match strongly on what it sees.\"),
            (180, 225, \"Chain of thought asks the model to reason step by step before answering. This dramatically improves accuracy on math and logic tasks.\"),
            (225, 270, \"Modern reasoning models do this natively. For older models, prompts like 'think step by step' or 'show your work' still help.\"),
            (270, 315, \"Tool use lets the model call functions. The model emits a structured call, your code executes it, and you return the result.\"),
            (315, 360, \"Tools turn LLMs into agents. They can search the web, query databases, send emails, and more. Always validate tool outputs before showing them.\"),
        ],
    },
]


async def seed_lectures(db) -> int:
    existing = await db.lectures.count_documents({})
    if existing > 0:
        return 0
    docs = []
    for s in _SAMPLES:
        lec = Lecture(
            id=s[\"id\"],
            title=s[\"title\"],
            description=s[\"description\"],
            instructor=s[\"instructor\"],
            duration=s[\"duration\"],
            thumbnail=s[\"thumbnail\"],
            video_url=s[\"video_url\"],
            tags=s[\"tags\"],
            chapters=[Chapter(**c) for c in s[\"chapters\"]],
            segments=[TranscriptSegment(start=a, end=b, text=t) for (a, b, t) in s[\"segments\"]],
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        docs.append(lec.model_dump())
    await db.lectures.insert_many(docs)
    return len(docs)
"
Observation: Create successful: /app/backend/seed_data.py