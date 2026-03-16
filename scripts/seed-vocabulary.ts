/**
 * scripts/seed-vocabulary.ts
 *
 * Run ONCE before starting the app:
 *   npx tsx scripts/seed-vocabulary.ts
 *
 * Pre-registers ~3500+ words across general English + tech/blockchain/LLM domains.
 * Safe to re-run — skips words that already exist, never creates duplicates.
 */

import { registerWord, loadVocabulary } from '../src/lib/vocabulary'

// ─────────────────────────────────────────────────────────────────────────────
// NOUNS
// ─────────────────────────────────────────────────────────────────────────────
const NOUNS: string[] = [

    // ── People ──
    'person', 'people', 'man', 'woman', 'child', 'boy', 'girl', 'baby', 'adult', 'human',
    'friend', 'family', 'parent', 'mother', 'father', 'brother', 'sister', 'son', 'daughter',
    'teacher', 'student', 'doctor', 'nurse', 'police', 'soldier', 'worker', 'leader', 'king',
    'queen', 'president', 'minister', 'scientist', 'artist', 'writer', 'player', 'actor',
    'founder', 'investor', 'developer', 'engineer', 'designer', 'analyst', 'researcher',
    'manager', 'director', 'officer', 'executive', 'consultant', 'advisor', 'mentor', 'partner',
    'client', 'customer', 'user', 'consumer', 'voter', 'citizen', 'resident', 'visitor', 'guest',

    // ── Places ──
    'place', 'city', 'town', 'village', 'country', 'nation', 'world', 'earth', 'land', 'area',
    'region', 'district', 'street', 'road', 'house', 'home', 'building', 'school', 'hospital',
    'church', 'market', 'shop', 'store', 'office', 'factory', 'farm', 'garden', 'park', 'forest',
    'mountain', 'river', 'lake', 'sea', 'ocean', 'island', 'desert', 'valley', 'field', 'ground',
    'server', 'datacenter', 'network', 'cloud', 'cluster', 'node', 'hub', 'gateway', 'endpoint',
    'platform', 'environment', 'ecosystem', 'infrastructure', 'architecture', 'repository',

    // ── General Things ──
    'thing', 'object', 'item', 'product', 'material', 'food', 'water', 'fire', 'air', 'light',
    'sound', 'voice', 'word', 'name', 'number', 'time', 'day', 'night', 'morning', 'evening',
    'week', 'month', 'year', 'century', 'moment', 'hour', 'minute', 'second', 'age', 'period',
    'book', 'page', 'letter', 'paper', 'pen', 'phone', 'computer', 'machine', 'tool', 'device',
    'car', 'truck', 'bus', 'train', 'plane', 'boat', 'ship', 'bicycle', 'wheel', 'engine',
    'door', 'window', 'wall', 'floor', 'roof', 'room', 'table', 'chair', 'bed', 'box',
    'bag', 'bottle', 'cup', 'glass', 'plate', 'knife', 'key', 'lock', 'rope', 'wire',
    'money', 'price', 'cost', 'value', 'tax', 'debt', 'profit', 'loss', 'income', 'wage',
    'law', 'rule', 'order', 'power', 'force', 'energy', 'war', 'peace', 'battle', 'army',
    'government', 'system', 'process', 'plan', 'idea', 'fact', 'truth', 'question', 'answer',
    'problem', 'solution', 'result', 'effect', 'cause', 'reason', 'purpose', 'goal', 'job',
    'work', 'task', 'project', 'team', 'group', 'class', 'type', 'kind', 'form', 'part',
    'piece', 'line', 'point', 'side', 'level', 'step', 'stage', 'rate', 'size', 'weight',
    'colour', 'color', 'shape', 'pattern', 'style', 'design', 'model', 'version', 'example',

    // ── Nature ──
    'tree', 'plant', 'flower', 'grass', 'leaf', 'seed', 'fruit', 'animal', 'bird', 'fish',
    'dog', 'cat', 'horse', 'cow', 'sheep', 'pig', 'chicken', 'snake', 'insect', 'bee',
    'sun', 'moon', 'star', 'sky', 'cloud', 'rain', 'snow', 'wind', 'storm', 'weather',
    'rock', 'stone', 'sand', 'soil', 'ice', 'smoke', 'dust', 'heat', 'cold',

    // ── Abstract ──
    'life', 'death', 'health', 'disease', 'pain', 'love', 'hate', 'fear', 'hope', 'dream',
    'mind', 'soul', 'heart', 'spirit', 'memory', 'knowledge', 'skill', 'ability', 'talent',
    'freedom', 'justice', 'truth', 'beauty', 'happiness', 'success', 'failure', 'change',
    'history', 'culture', 'society', 'community', 'relationship', 'connection', 'difference',

    // ── General Tech ──
    'technology', 'software', 'hardware', 'code', 'program', 'application', 'app', 'website',
    'interface', 'feature', 'function', 'module', 'library', 'framework', 'runtime', 'compiler',
    'database', 'query', 'table', 'schema', 'index', 'record', 'field', 'column', 'row',
    'algorithm', 'logic', 'operation', 'instruction', 'command', 'script', 'pipeline', 'workflow',
    'file', 'folder', 'directory', 'path', 'extension', 'format', 'protocol', 'standard',
    'request', 'response', 'payload', 'header', 'body', 'parameter', 'variable', 'constant',
    'object', 'class', 'instance', 'method', 'property', 'attribute', 'constructor', 'interface',
    'array', 'list', 'stack', 'queue', 'tree', 'graph', 'hash', 'map', 'set', 'iterator',
    'loop', 'condition', 'exception', 'error', 'bug', 'patch', 'release', 'version', 'branch',
    'commit', 'merge', 'fork', 'pull', 'push', 'clone', 'dependency', 'package', 'bundle',
    'test', 'debug', 'log', 'metric', 'monitor', 'alert', 'dashboard', 'report', 'audit',
    'security', 'encryption', 'decryption', 'certificate', 'signature', 'authentication',
    'authorization', 'permission', 'role', 'access', 'token', 'session', 'cookie', 'cache',
    'bandwidth', 'latency', 'throughput', 'performance', 'scalability', 'availability',
    'redundancy', 'backup', 'recovery', 'deployment', 'migration', 'integration', 'automation',

    // ── Internet & Web ──
    'internet', 'web', 'browser', 'domain', 'url', 'link', 'page', 'site', 'portal', 'feed',
    'api', 'rest', 'graphql', 'webhook', 'socket', 'stream', 'event', 'message', 'queue',
    'proxy', 'firewall', 'vpn', 'dns', 'ip', 'address', 'port', 'protocol', 'packet', 'router',
    'cloud', 'saas', 'paas', 'iaas', 'microservice', 'container', 'docker', 'kubernetes', 'pod',
    'instance', 'replica', 'shard', 'partition', 'region', 'zone', 'bucket', 'blob', 'volume',

    // ── Blockchain & Crypto ──
    'blockchain', 'block', 'chain', 'ledger', 'transaction', 'hash', 'nonce', 'consensus',
    'node', 'validator', 'miner', 'wallet', 'address', 'key', 'signature', 'proof',
    'token', 'coin', 'cryptocurrency', 'bitcoin', 'ethereum', 'altcoin', 'stablecoin',
    'defi', 'dex', 'cex', 'exchange', 'swap', 'liquidity', 'pool', 'vault', 'yield',
    'stake', 'staking', 'delegation', 'reward', 'slash', 'epoch', 'slot', 'finality',
    'smart contract', 'contract', 'bytecode', 'abi', 'function', 'event', 'emit', 'deploy',
    'gas', 'fee', 'gwei', 'wei', 'ether', 'satoshi', 'mempool', 'broadcast', 'confirmation',
    'fork', 'hardfork', 'softfork', 'genesis', 'mainnet', 'testnet', 'devnet', 'rpc',
    'nft', 'mint', 'burn', 'transfer', 'approve', 'allowance', 'royalty', 'metadata',
    'dao', 'governance', 'proposal', 'vote', 'quorum', 'multisig', 'treasury', 'grant',
    'bridge', 'relay', 'oracle', 'chainlink', 'feed', 'aggregator', 'keeper', 'resolver',
    'layer', 'rollup', 'sidechain', 'parachain', 'sharding', 'channel', 'plasma', 'zk',
    'proof', 'witness', 'merkle', 'trie', 'patricia', 'bloom', 'filter', 'snapshot',
    'seed', 'phrase', 'mnemonic', 'entropy', 'derivation', 'path', 'xpub', 'xprv',
    'protocol', 'standard', 'erc20', 'erc721', 'erc1155', 'bep20', 'spl', 'cw20',
    'dapp', 'frontend', 'backend', 'indexer', 'subgraph', 'event', 'log', 'receipt',
    'airdrop', 'snapshot', 'whitelist', 'allowlist', 'presale', 'ido', 'ico', 'launchpad',
    'yield farming', 'apy', 'apr', 'tvl', 'volume', 'liquidity', 'slippage', 'impermanent',
    'collateral', 'loan', 'borrow', 'lend', 'interest', 'rate', 'liquidation', 'margin',
    'perpetual', 'future', 'option', 'derivative', 'synthetic', 'index', 'basket', 'portfolio',
    'wallet', 'hot wallet', 'cold wallet', 'custodian', 'custody', 'multisig', 'threshold',
    'seed round', 'series', 'valuation', 'tokenomics', 'supply', 'emission', 'vesting', 'cliff',
    'whitepaper', 'roadmap', 'milestone', 'hackathon', 'bounty', 'grant', 'ecosystem',

    // ── Artificial Intelligence & LLM ──
    'intelligence', 'ai', 'model', 'llm', 'language', 'training', 'inference', 'prediction',
    'input', 'output', 'prompt', 'completion', 'response', 'generation', 'sampling', 'decoding',
    'token', 'tokenizer', 'vocabulary', 'embedding', 'vector', 'dimension', 'space', 'distance',
    'attention', 'transformer', 'encoder', 'decoder', 'layer', 'head', 'weight', 'bias',
    'gradient', 'loss', 'optimizer', 'learning', 'epoch', 'batch', 'step', 'checkpoint',
    'parameter', 'hyperparameter', 'architecture', 'backbone', 'baseline', 'benchmark',
    'dataset', 'corpus', 'sample', 'label', 'annotation', 'feature', 'representation',
    'classification', 'regression', 'generation', 'summarization', 'translation', 'retrieval',
    'finetuning', 'pretraining', 'alignment', 'rlhf', 'reward', 'policy', 'agent', 'environment',
    'context', 'window', 'memory', 'retrieval', 'augmentation', 'grounding', 'hallucination',
    'reasoning', 'chain', 'thought', 'reflection', 'planning', 'tool', 'function', 'call',
    'multimodal', 'vision', 'audio', 'speech', 'image', 'video', 'text', 'document',
    'openai', 'anthropic', 'google', 'meta', 'mistral', 'llama', 'gpt', 'claude', 'gemini',
    'bert', 'gpt2', 'gpt3', 'gpt4', 'palm', 't5', 'falcon', 'mixtral', 'phi', 'qwen',
    'huggingface', 'langchain', 'llamaindex', 'pinecone', 'weaviate', 'chroma', 'qdrant',
    'rag', 'reranker', 'retriever', 'chunking', 'splitting', 'overlap', 'stride', 'passage',
    'semantic', 'similarity', 'relevance', 'ranking', 'scoring', 'threshold', 'cutoff',
    'agent', 'tool', 'plugin', 'action', 'observation', 'plan', 'executor', 'orchestrator',
    'system prompt', 'instruction', 'constraint', 'persona', 'role', 'format', 'schema',
    'json', 'xml', 'markdown', 'structured', 'unstructured', 'parsing', 'extraction',
    'evaluation', 'metric', 'bleu', 'rouge', 'perplexity', 'accuracy', 'precision', 'recall',
    'hallucination', 'grounding', 'faithfulness', 'coherence', 'fluency', 'diversity',
    'safety', 'alignment', 'bias', 'fairness', 'toxicity', 'censorship', 'filter', 'guard',
    'deployment', 'serving', 'endpoint', 'latency', 'throughput', 'cost', 'efficiency',
    'quantization', 'pruning', 'distillation', 'compression', 'optimization', 'acceleration',
    'gpu', 'tpu', 'cpu', 'memory', 'vram', 'ram', 'compute', 'hardware', 'accelerator',
    'openai api', 'anthropic api', 'vertex', 'sagemaker', 'bedrock', 'azure', 'inference',

    // ── Data Science & Analytics ──
    'data', 'analysis', 'analytics', 'statistics', 'probability', 'distribution', 'mean',
    'median', 'variance', 'deviation', 'correlation', 'regression', 'clustering', 'classification',
    'visualization', 'chart', 'graph', 'plot', 'dashboard', 'insight', 'trend', 'pattern',
    'pipeline', 'etl', 'transformation', 'cleaning', 'preprocessing', 'normalization',
    'feature engineering', 'selection', 'dimensionality', 'reduction', 'pca', 'tsne', 'umap',
    'training set', 'test set', 'validation', 'split', 'fold', 'cross-validation', 'overfitting',
    'underfitting', 'regularization', 'dropout', 'batch normalization', 'augmentation',

    // ── Finance & Economics ──
    'finance', 'economy', 'market', 'stock', 'bond', 'equity', 'asset', 'liability',
    'revenue', 'expense', 'profit', 'margin', 'capital', 'investment', 'return', 'risk',
    'portfolio', 'diversification', 'hedge', 'arbitrage', 'speculation', 'volatility',
    'inflation', 'deflation', 'interest', 'rate', 'monetary', 'fiscal', 'policy', 'regulation',
    'bank', 'institution', 'fund', 'venture', 'private equity', 'ipo', 'listing', 'dividend',
]

// ─────────────────────────────────────────────────────────────────────────────
// VERBS
// ─────────────────────────────────────────────────────────────────────────────
const VERBS: string[] = [

    // ── Core English ──
    'be', 'have', 'do', 'say', 'get', 'make', 'go', 'know', 'take', 'see', 'come', 'think',
    'look', 'want', 'give', 'use', 'find', 'tell', 'ask', 'seem', 'feel', 'try', 'leave',
    'call', 'keep', 'let', 'begin', 'show', 'hear', 'play', 'run', 'move', 'live', 'believe',
    'hold', 'bring', 'happen', 'write', 'provide', 'sit', 'stand', 'lose', 'pay', 'meet',
    'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand', 'watch', 'follow',
    'stop', 'create', 'speak', 'read', 'spend', 'grow', 'open', 'walk', 'win', 'offer',
    'remember', 'love', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send', 'build',
    'stay', 'fall', 'cut', 'reach', 'kill', 'remain', 'suggest', 'raise', 'pass', 'sell',
    'require', 'report', 'decide', 'pull', 'break', 'describe', 'develop', 'agree', 'add',
    'return', 'help', 'start', 'turn', 'place', 'mean', 'close', 'receive', 'allow', 'accept',
    'draw', 'fill', 'need', 'join', 'form', 'produce', 'exist', 'carry', 'fight', 'drive',
    'eat', 'drink', 'sleep', 'wake', 'work', 'study', 'teach', 'travel', 'visit', 'talk',
    'listen', 'plan', 'choose', 'pick', 'drop', 'throw', 'catch', 'push', 'lift', 'release',
    'enter', 'exit', 'rise', 'increase', 'decrease', 'expand', 'reduce', 'improve', 'damage',
    'destroy', 'protect', 'attack', 'defend', 'escape', 'hide', 'reveal', 'discover', 'explore',
    'search', 'collect', 'share', 'connect', 'separate', 'combine', 'divide', 'compare',
    'measure', 'test', 'check', 'explain', 'define', 'identify', 'recognize', 'forget',

    // ── Tech & Engineering ──
    'code', 'program', 'build', 'deploy', 'run', 'execute', 'compile', 'parse', 'render',
    'install', 'configure', 'initialize', 'bootstrap', 'scaffold', 'generate', 'migrate',
    'debug', 'test', 'lint', 'format', 'refactor', 'optimize', 'benchmark', 'profile',
    'commit', 'push', 'pull', 'merge', 'fork', 'clone', 'branch', 'rebase', 'release',
    'fetch', 'query', 'insert', 'update', 'delete', 'index', 'cache', 'invalidate', 'flush',
    'authenticate', 'authorize', 'encrypt', 'decrypt', 'hash', 'sign', 'verify', 'validate',
    'request', 'respond', 'send', 'receive', 'broadcast', 'subscribe', 'publish', 'emit',
    'monitor', 'log', 'trace', 'alert', 'scale', 'provision', 'containerize', 'orchestrate',
    'integrate', 'automate', 'schedule', 'trigger', 'process', 'transform', 'aggregate',
    'serialize', 'deserialize', 'encode', 'decode', 'compress', 'decompress', 'stream',

    // ── Blockchain ──
    'mint', 'burn', 'transfer', 'swap', 'stake', 'unstake', 'delegate', 'vote', 'propose',
    'approve', 'reject', 'execute', 'deploy', 'interact', 'call', 'emit', 'log', 'index',
    'bridge', 'wrap', 'unwrap', 'lock', 'unlock', 'deposit', 'withdraw', 'claim', 'harvest',
    'liquidate', 'borrow', 'lend', 'repay', 'supply', 'collateralize', 'flash', 'arbitrage',
    'mine', 'validate', 'attest', 'finalize', 'checkpoint', 'slash', 'penalize', 'reward',
    'airdrop', 'distribute', 'vest', 'cliff', 'unlock', 'whitelist', 'blacklist', 'pause',
    'upgrade', 'proxy', 'delegate', 'govern', 'fork', 'snapshot', 'verify', 'audit',

    // ── AI & ML ──
    'train', 'finetune', 'pretrain', 'evaluate', 'infer', 'predict', 'generate', 'sample',
    'embed', 'encode', 'decode', 'tokenize', 'chunk', 'split', 'retrieve', 'rerank', 'score',
    'prompt', 'complete', 'summarize', 'translate', 'classify', 'detect', 'extract', 'parse',
    'align', 'reinforce', 'reward', 'penalize', 'optimize', 'converge', 'overfit', 'regularize',
    'augment', 'normalize', 'scale', 'reduce', 'cluster', 'classify', 'regress', 'interpolate',
    'quantize', 'prune', 'distill', 'compress', 'accelerate', 'serve', 'deploy', 'monitor',
    'hallucinate', 'ground', 'constrain', 'filter', 'guard', 'moderate', 'evaluate', 'benchmark',
]

// ─────────────────────────────────────────────────────────────────────────────
// ADJECTIVES
// ─────────────────────────────────────────────────────────────────────────────
const ADJECTIVES: string[] = [

    // ── Core English ──
    'big', 'small', 'large', 'little', 'huge', 'tiny', 'tall', 'short', 'long', 'wide',
    'narrow', 'thick', 'thin', 'deep', 'shallow', 'heavy', 'light', 'full', 'empty', 'high',
    'good', 'bad', 'great', 'poor', 'best', 'worst', 'better', 'worse', 'fine', 'awful',
    'beautiful', 'ugly', 'clean', 'dirty', 'fresh', 'old', 'new', 'young', 'ancient', 'modern',
    'strong', 'weak', 'hard', 'soft', 'fast', 'slow', 'loud', 'quiet', 'hot', 'cold',
    'warm', 'cool', 'wet', 'dry', 'bright', 'dark', 'sharp', 'dull', 'smooth', 'rough',
    'happy', 'sad', 'angry', 'afraid', 'surprised', 'confused', 'tired', 'sick', 'healthy',
    'alive', 'dead', 'free', 'busy', 'ready', 'safe', 'dangerous', 'easy', 'difficult', 'simple',
    'complex', 'clear', 'unclear', 'true', 'false', 'real', 'fake', 'open', 'closed', 'public',
    'private', 'common', 'rare', 'normal', 'strange', 'important', 'useless', 'useful', 'popular',
    'many', 'few', 'much', 'more', 'less', 'most', 'least', 'all', 'some', 'any',
    'every', 'both', 'each', 'other', 'same', 'different', 'first', 'last', 'next', 'previous',
    'early', 'late', 'recent', 'current', 'future', 'past', 'main', 'major', 'minor', 'entire',
    'whole', 'single', 'double', 'multiple', 'various', 'certain', 'possible', 'likely', 'able',
    'red', 'blue', 'green', 'yellow', 'white', 'black', 'brown', 'grey', 'orange', 'purple',

    // ── Tech ──
    'digital', 'virtual', 'physical', 'online', 'offline', 'real-time', 'synchronous',
    'asynchronous', 'distributed', 'centralized', 'decentralized', 'federated', 'peer',
    'open', 'closed', 'proprietary', 'open-source', 'cross-platform', 'native', 'hybrid',
    'scalable', 'reliable', 'resilient', 'fault-tolerant', 'high-availability', 'redundant',
    'encrypted', 'secure', 'authenticated', 'authorized', 'signed', 'verified', 'trusted',
    'stateless', 'stateful', 'immutable', 'mutable', 'persistent', 'ephemeral', 'volatile',
    'compiled', 'interpreted', 'typed', 'dynamic', 'static', 'functional', 'declarative',
    'modular', 'monolithic', 'serverless', 'containerized', 'microservice', 'event-driven',
    'responsive', 'adaptive', 'progressive', 'interactive', 'reactive', 'composable',
    'deprecated', 'legacy', 'experimental', 'stable', 'production', 'beta', 'alpha',

    // ── Blockchain ──
    'decentralized', 'trustless', 'permissionless', 'permissioned', 'immutable', 'transparent',
    'pseudonymous', 'anonymous', 'public', 'private', 'on-chain', 'off-chain', 'cross-chain',
    'fungible', 'non-fungible', 'liquid', 'illiquid', 'volatile', 'stable', 'pegged', 'floating',
    'deflationary', 'inflationary', 'deflationary', 'capped', 'uncapped', 'vested', 'locked',
    'audited', 'unaudited', 'verified', 'deployed', 'upgradeable', 'pausable', 'burnable',
    'mintable', 'transferable', 'staked', 'delegated', 'slashed', 'finalized', 'confirmed',
    'pending', 'failed', 'reverted', 'included', 'orphaned', 'canonical', 'valid', 'invalid',

    // ── AI & ML ──
    'intelligent', 'artificial', 'neural', 'deep', 'shallow', 'supervised', 'unsupervised',
    'reinforced', 'pretrained', 'finetuned', 'aligned', 'unaligned', 'grounded', 'hallucinated',
    'deterministic', 'stochastic', 'probabilistic', 'generative', 'discriminative', 'autoregressive',
    'bidirectional', 'causal', 'masked', 'sparse', 'dense', 'compressed', 'quantized', 'pruned',
    'multilingual', 'multimodal', 'zero-shot', 'few-shot', 'in-context', 'chain-of-thought',
    'accurate', 'precise', 'relevant', 'coherent', 'fluent', 'diverse', 'creative', 'factual',
    'safe', 'unsafe', 'toxic', 'harmless', 'helpful', 'honest', 'capable', 'limited', 'biased',

    // ── Finance ──
    'profitable', 'loss-making', 'solvent', 'insolvent', 'liquid', 'illiquid', 'leveraged',
    'hedged', 'diversified', 'concentrated', 'long', 'short', 'bullish', 'bearish', 'neutral',
    'volatile', 'stable', 'correlated', 'uncorrelated', 'risk-adjusted', 'risk-free',
]

// ─────────────────────────────────────────────────────────────────────────────
// ADVERBS
// ─────────────────────────────────────────────────────────────────────────────
const ADVERBS: string[] = [

    // ── Core English ──
    'very', 'really', 'quite', 'just', 'also', 'still', 'even', 'already', 'always', 'never',
    'often', 'sometimes', 'usually', 'generally', 'mostly', 'mainly', 'especially', 'particularly',
    'actually', 'basically', 'essentially', 'literally', 'probably', 'possibly', 'certainly',
    'definitely', 'clearly', 'obviously', 'apparently', 'quickly', 'slowly', 'easily', 'hardly',
    'nearly', 'almost', 'exactly', 'completely', 'totally', 'fully', 'largely', 'simply',
    'directly', 'immediately', 'suddenly', 'finally', 'eventually', 'recently', 'soon',
    'again', 'together', 'away', 'back', 'around', 'along', 'ahead', 'further', 'instead',
    'otherwise', 'therefore', 'however', 'enough', 'too', 'more', 'less', 'most', 'least',
    'well', 'badly', 'hard', 'fast', 'early', 'late', 'long', 'far', 'near', 'here', 'there',
    'now', 'then', 'today', 'yesterday', 'tomorrow', 'ago', 'later', 'before', 'after',

    // ── Tech ──
    'automatically', 'manually', 'programmatically', 'dynamically', 'statically', 'recursively',
    'iteratively', 'asynchronously', 'synchronously', 'concurrently', 'sequentially', 'lazily',
    'eagerly', 'efficiently', 'optimally', 'reliably', 'securely', 'transparently', 'publicly',
    'privately', 'locally', 'remotely', 'globally', 'incrementally', 'atomically', 'idempotently',

    // ── Blockchain ──
    'on-chain', 'off-chain', 'trustlessly', 'permissionlessly', 'immutably', 'transparently',
    'cryptographically', 'deterministically', 'probabilistically', 'economically', 'natively',
    'atomically', 'irreversibly', 'finally', 'canonically', 'consensually', 'verifiably',

    // ── AI ──
    'intelligently', 'adaptively', 'autonomously', 'generatively', 'semantically', 'contextually',
    'probabilistically', 'stochastically', 'recursively', 'iteratively', 'progressively',
    'accurately', 'precisely', 'coherently', 'fluently', 'factually', 'safely', 'helpfully',
]

// ─────────────────────────────────────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
    console.log('🌱 Seeding vocabulary...\n')

    const before = loadVocabulary().nextId - 1
    let processed = 0

    const register = (words: string[], pos: 'noun' | 'verb' | 'adjective' | 'adverb') => {
        for (const word of words) {
            const trimmed = word.trim().toLowerCase()
            if (!trimmed) continue
            registerWord(trimmed, pos)
            processed++
        }
    }

    register(NOUNS, 'noun')
    register(VERBS, 'verb')
    register(ADJECTIVES, 'adjective')
    register(ADVERBS, 'adverb')

    const after = loadVocabulary().nextId - 1
    const fresh = after - before

    console.log(`✅  Seeding complete!\n`)
    console.log(`    Words already known  : ${before}`)
    console.log(`    Words processed      : ${processed}`)
    console.log(`    New words added      : ${fresh}`)
    console.log(`    Total vocabulary     : ${after}`)
    console.log(`\n📁  Saved → data/vocabulary.json`)

    if (fresh === 0) {
        console.log(`\n💡  All words were already known. Run DELETE /api/vocabulary to reset if needed.`)
    }
}

seed().catch(console.error)
