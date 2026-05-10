"""Seed sample lectures with transcripts. Idempotent - only inserts when collection is empty."""
from datetime import datetime, timezone
from typing import List
from models import Chapter, TranscriptSegment


async def seed_lectures(db) -> int:
    if await db.lectures.count_documents({}) > 0:
        return 0

    _SAMPLES = [
        {
            "id": "lec-neural-nets",
            "title": "Neural Networks: From Perceptrons to Transformers",
            "description": "A foundational tour of neural networks — what they are, how they learn, and why transformers changed everything in AI.",
            "instructor": "Dr. Maya Chen",
            "duration": 596.0,
            "thumbnail": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "tags": ["AI", "Deep Learning", "Foundations"],
            "chapters": [
                {"title": "What is a neuron?", "start": 0, "end": 90},
                {"title": "Forward & backward pass", "start": 90, "end": 220},
                {"title": "Activation functions", "start": 220, "end": 340},
                {"title": "From RNNs to Transformers", "start": 340, "end": 480},
                {"title": "Attention is all you need", "start": 480, "end": 596},
            ],
            "segments": [
                (0, 12, "Welcome to neural networks. Today we will build intuition from the perceptron all the way to the transformer architecture that powers modern AI."),
                (12, 28, "A neuron is a simple computational unit. It takes inputs, multiplies them by weights, adds a bias, and applies an activation function to produce an output."),
                (28, 48, "Stacking neurons in layers gives us a feed-forward network. Each layer transforms its input and passes it forward to the next layer."),
                (48, 70, "Training a network means finding weights that minimize a loss function. We measure how wrong the prediction is and nudge weights in the right direction."),
                (70, 90, "Gradient descent is the workhorse of deep learning. It uses the gradient of the loss with respect to the weights to make small improvement steps."),
                (90, 115, "The forward pass computes activations layer by layer. The backward pass uses the chain rule to compute gradients efficiently. This is backpropagation."),
                (115, 145, "Backpropagation reuses intermediate computations. Without it, training deep networks would be intractable. It is one of the most important algorithms in machine learning."),
                (145, 175, "Mini-batch stochastic gradient descent processes a small batch of examples at a time. This makes training fast and adds beneficial noise to the gradient estimate."),
                (175, 220, "Optimizers like Adam adapt the learning rate per parameter. Adam combines momentum with adaptive scaling and is the default choice for most modern networks."),
                (220, 250, "Activation functions add non-linearity. Without them, a deep network would collapse to a single linear transformation, regardless of depth."),
                (250, 285, "ReLU — the rectified linear unit — returns max of zero and x. It is simple, fast, and avoids the vanishing gradient problem of sigmoids and tanh."),
                (285, 320, "GELU and SiLU are smoother variants used in transformers. They produce slightly better gradients near zero and are popular in modern architectures."),
                (320, 340, "Choosing an activation function matters less than architecture design, but ReLU and its variants are reliable defaults."),
                (340, 380, "Recurrent neural networks process sequences one token at a time, maintaining a hidden state. They are natural for language but struggle with long-range dependencies."),
                (380, 425, "LSTMs and GRUs use gating to control what information to retain. They were state-of-the-art in NLP before 2017 but are slow because they cannot be parallelized."),
                (425, 480, "The transformer architecture replaced recurrence with self-attention. Every token attends to every other token in parallel, enabling massive scale."),
                (480, 520, "Self-attention computes a weighted sum of value vectors. The weights come from the dot product of queries and keys, scaled and softmaxed."),
                (520, 560, "Multi-head attention runs several attention operations in parallel. Different heads learn to focus on different relationships in the data."),
                (560, 596, "The transformer is now the foundation of GPT, BERT, and modern multimodal models. Understanding attention is the key to understanding modern AI."),
            ],
        },
        {
            "id": "lec-rag",
            "title": "Retrieval Augmented Generation, Explained",
            "description": "How RAG combines vector search with LLMs to produce factual, citation-backed answers from your own private data.",
            "instructor": "Prof. James Okafor",
            "duration": 512.0,
            "thumbnail": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "tags": ["RAG", "LLMs", "Vector Search"],
            "chapters": [
                {"title": "Why LLMs hallucinate", "start": 0, "end": 80},
                {"title": "The retrieval layer", "start": 80, "end": 200},
                {"title": "Vector embeddings", "start": 200, "end": 320},
                {"title": "Putting it all together", "start": 320, "end": 420},
                {"title": "Production considerations", "start": 420, "end": 512},
            ],
            "segments": [
                (0, 18, "Large language models are trained on static snapshots of the internet. They can't know about events after their training cutoff date."),
                (18, 40, "More importantly, they have no access to your private data — your documents, databases, or internal knowledge bases."),
                (40, 65, "Hallucination is the term for when a model generates plausible-sounding but factually wrong information. It's one of the biggest challenges in deploying LLMs."),
                (65, 80, "Retrieval Augmented Generation, or RAG, addresses both problems by fetching relevant context before generating a response."),
                (80, 110, "The retrieval layer is a search system that can quickly find relevant documents from a large corpus given a user query."),
                (110, 145, "Traditional search uses keyword matching — BM25 or TF-IDF. These work well but miss semantic meaning. Searching 'car' won't find documents about 'automobile'."),
                (145, 180, "Dense retrieval uses neural embeddings. A query and a document are mapped to vectors in the same space. Similar meaning means nearby vectors."),
                (180, 200, "The key insight is that embedding models learn to place semantically similar text near each other, regardless of the exact words used."),
                (200, 235, "An embedding is a dense vector — typically 768 to 1536 dimensions — that represents the meaning of a piece of text."),
                (235, 265, "To build a RAG system, you first chunk your documents into smaller pieces — typically 200 to 500 tokens each."),
                (265, 300, "Then you embed each chunk using a model like text-embedding-ada-002 or an open-source alternative, and store the vectors in a vector database."),
                (300, 320, "At query time, you embed the user's question and search the vector database for the most similar document chunks."),
                (320, 360, "The retrieved chunks are inserted into the LLM's prompt as context. The model then generates an answer grounded in those specific documents."),
                (360, 395, "This is the core RAG loop: retrieve, augment, generate. Simple but powerful. The LLM becomes a reader and reasoner, not a knowledge store."),
                (395, 420, "Hybrid search combines dense and sparse retrieval — using both semantic similarity and keyword matching for better recall."),
                (420, 455, "In production, chunk size matters enormously. Too small and you lose context. Too large and you dilute relevance. 256-512 tokens is a good starting point."),
                (455, 490, "Re-ranking is a second pass that uses a cross-encoder to score each retrieved chunk against the query with higher accuracy than the initial retrieval."),
                (490, 512, "RAG is not a silver bullet. Your retrieval quality is the ceiling of your answer quality. Good chunking, good embedding, good indexing — all matter."),
            ],
        },
        {
            "id": "lec-systems",
            "title": "Distributed Systems: The Hard Parts",
            "description": "CAP theorem, consensus, eventual consistency, and why building reliable distributed systems is genuinely difficult.",
            "instructor": "Dr. Anika Patel",
            "duration": 630.0,
            "thumbnail": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "tags": ["Systems", "Databases", "Distributed"],
            "chapters": [
                {"title": "Why distributed?", "start": 0, "end": 100},
                {"title": "CAP theorem", "start": 100, "end": 220},
                {"title": "Consensus algorithms", "start": 220, "end": 380},
                {"title": "Eventual consistency", "start": 380, "end": 510},
                {"title": "Practical patterns", "start": 510, "end": 630},
            ],
            "segments": [
                (0, 20, "A distributed system is a collection of independent computers that appears to its users as a single coherent system."),
                (20, 45, "We build distributed systems for three reasons: scalability, fault tolerance, and latency. A single machine can only scale so far."),
                (45, 75, "But distribution introduces fundamental problems. Machines fail. Networks partition. Messages get lost, delayed, or duplicated."),
                (75, 100, "The first rule of distributed systems: do not assume the network is reliable. Assume it will fail, and design accordingly."),
                (100, 135, "The CAP theorem, proven by Eric Brewer, states that a distributed system can provide at most two of three guarantees: Consistency, Availability, and Partition tolerance."),
                (135, 170, "Partition tolerance is not optional in practice — networks do partition. So the real choice is between consistency and availability during a partition."),
                (170, 200, "CP systems choose consistency over availability. When a partition occurs, they refuse requests rather than return potentially stale data. Traditional relational databases often make this trade."),
                (200, 220, "AP systems choose availability over consistency. They continue serving requests during partitions, but may return stale data. DynamoDB and Cassandra are AP systems."),
                (220, 260, "Consensus is the problem of getting multiple nodes to agree on a single value, even when some nodes fail or messages are lost."),
                (260, 300, "Paxos, designed by Leslie Lamport, was the first practical consensus algorithm. It guarantees safety but is notoriously difficult to understand and implement correctly."),
                (300, 345, "Raft was designed to be more understandable than Paxos. It divides consensus into leader election, log replication, and safety. Used in etcd and CockroachDB."),
                (345, 380, "The fundamental limitation of consensus: you need a quorum — more than half the nodes — to make progress. This limits availability."),
                (380, 415, "Eventual consistency is a weaker guarantee: if no new updates are made, all replicas will eventually converge to the same value."),
                (415, 450, "Vector clocks track causality in distributed systems. They let nodes determine whether events are causally related or concurrent without a central clock."),
                (450, 490, "CRDTs — Conflict-free Replicated Data Types — are data structures that can be merged automatically. Counters, sets, and last-write-wins registers are common examples."),
                (490, 510, "The real insight of eventual consistency: many applications don't need strong consistency. Shopping carts, social feeds, and counters can tolerate temporary divergence."),
                (510, 555, "The saga pattern handles distributed transactions without two-phase commit. Each service performs a local transaction and publishes an event. If something fails, compensating transactions roll back the changes."),
                (555, 595, "Circuit breakers prevent cascading failures. When a downstream service is failing, the circuit breaker trips and returns errors immediately instead of waiting for timeouts."),
                (595, 630, "Building distributed systems means accepting that failure is not an exception — it is the norm. Design for failure, test for failure, and monitor for failure."),
            ],
        },
    ]

    docs = []
    for sample in _SAMPLES:
        raw_segs = sample.pop("segments")
        sample["segments"] = [
            {"start": s[0], "end": s[1], "text": s[2]} for s in raw_segs
        ]
        raw_chs = sample.get("chapters", [])
        sample["chapters"] = [
            {"title": c["title"], "start": c["start"], "end": c["end"]} for c in raw_chs
        ]
        sample["created_at"] = datetime.now(timezone.utc).isoformat()
        docs.append(sample)

    await db.lectures.insert_many(docs)
    return len(docs)
