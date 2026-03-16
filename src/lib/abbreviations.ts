/**
 * lib/abbreviations.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Abbreviation → full form lookup map.
 *
 * Used by both /api/symbolize and /api/speak to expand abbreviations
 * BEFORE sending text to Gemini, so the model always sees full words
 * and the vocabulary registers clean base forms.
 *
 * Keys are lowercase. The expander handles case-insensitive matching.
 * Add new entries freely — the map is plain data, no rebuild needed.
 */

export const ABBREVIATIONS: Record<string, string> = {

    // ── AI / ML ──────────────────────────────────────────────────────────────
    'ai': 'artificial intelligence',
    'ml': 'machine learning',
    'dl': 'deep learning',
    'llm': 'large language model',
    'llms': 'large language models',
    'nlp': 'natural language processing',
    'nlu': 'natural language understanding',
    'nlg': 'natural language generation',
    'cv': 'computer vision',
    'rl': 'reinforcement learning',
    'rlhf': 'reinforcement learning from human feedback',
    'rlaif': 'reinforcement learning from ai feedback',
    'sft': 'supervised fine tuning',
    'ppo': 'proximal policy optimization',
    'dpo': 'direct preference optimization',
    'gpt': 'generative pretrained transformer',
    'bert': 'bidirectional encoder representations from transformers',
    't5': 'text to text transfer transformer',
    'vae': 'variational autoencoder',
    'gan': 'generative adversarial network',
    'cnn': 'convolutional neural network',
    'rnn': 'recurrent neural network',
    'lstm': 'long short term memory',
    'gru': 'gated recurrent unit',
    'rag': 'retrieval augmented generation',
    'cot': 'chain of thought',
    'tot': 'tree of thought',
    'moe': 'mixture of experts',
    'kv': 'key value',
    'kv cache': 'key value cache',
    'lora': 'low rank adaptation',
    'qlora': 'quantized low rank adaptation',
    'peft': 'parameter efficient fine tuning',
    'vllm': 'virtual large language model',
    'tgi': 'text generation inference',
    'hf': 'hugging face',
    'api': 'application programming interface',
    'sdk': 'software development kit',
    'cli': 'command line interface',
    'gui': 'graphical user interface',
    'ui': 'user interface',
    'ux': 'user experience',

    // ── Models ───────────────────────────────────────────────────────────────
    'gpt4': 'gpt four',
    'gpt3': 'gpt three',
    'gpt2': 'gpt two',
    'gpt-4': 'gpt four',
    'gpt-3': 'gpt three',
    'gpt-2': 'gpt two',
    'claude3': 'claude three',
    'claude-3': 'claude three',
    'gemini': 'gemini model',
    'llama': 'llama model',
    'llama2': 'llama two',
    'llama3': 'llama three',
    'llama-2': 'llama two',
    'llama-3': 'llama three',
    'mistral': 'mistral model',
    'mixtral': 'mixtral mixture of experts model',
    'phi': 'phi model',
    'qwen': 'qwen model',
    'palm': 'pathways language model',
    'palm2': 'pathways language model two',

    // ── Blockchain & Crypto ───────────────────────────────────────────────────
    'btc': 'bitcoin',
    'eth': 'ethereum',
    'bnb': 'binance coin',
    'sol': 'solana',
    'ada': 'cardano',
    'dot': 'polkadot',
    'avax': 'avalanche',
    'matic': 'polygon',
    'link': 'chainlink',
    'uni': 'uniswap',
    'aave': 'aave protocol',
    'crv': 'curve finance',
    'mkr': 'maker dao',
    'dai': 'dai stablecoin',
    'usdc': 'usd coin',
    'usdt': 'tether',
    'wbtc': 'wrapped bitcoin',
    'weth': 'wrapped ether',
    'nft': 'non fungible token',
    'nfts': 'non fungible tokens',
    'dao': 'decentralized autonomous organization',
    'daos': 'decentralized autonomous organizations',
    'defi': 'decentralized finance',
    'cefi': 'centralized finance',
    'dex': 'decentralized exchange',
    'cex': 'centralized exchange',
    'amm': 'automated market maker',
    'lp': 'liquidity provider',
    'tvl': 'total value locked',
    'apy': 'annual percentage yield',
    'apr': 'annual percentage rate',
    'pos': 'proof of stake',
    'pow': 'proof of work',
    'pob': 'proof of burn',
    'dpos': 'delegated proof of stake',
    'bft': 'byzantine fault tolerance',
    'pbft': 'practical byzantine fault tolerance',
    'evm': 'ethereum virtual machine',
    'eoa': 'externally owned account',
    'abi': 'application binary interface',
    'rpc': 'remote procedure call',
    'p2p': 'peer to peer',
    'p2e': 'play to earn',
    'erc': 'ethereum request for comment',
    'erc20': 'ethereum fungible token standard',
    'erc721': 'ethereum non fungible token standard',
    'erc1155': 'ethereum multi token standard',
    'bep20': 'binance smart chain token standard',
    'ico': 'initial coin offering',
    'ido': 'initial decentralized offering',
    'ipo': 'initial public offering',
    'kyc': 'know your customer',
    'aml': 'anti money laundering',
    'zk': 'zero knowledge',
    'zkp': 'zero knowledge proof',
    'zksnark': 'zero knowledge succinct non interactive argument of knowledge',
    'zkstark': 'zero knowledge scalable transparent argument of knowledge',
    'l1': 'layer one blockchain',
    'l2': 'layer two blockchain',
    'l3': 'layer three blockchain',
    'l0': 'layer zero blockchain',

    // ── General Tech ─────────────────────────────────────────────────────────
    'os': 'operating system',
    'cpu': 'central processing unit',
    'gpu': 'graphics processing unit',
    'tpu': 'tensor processing unit',
    'ram': 'random access memory',
    'rom': 'read only memory',
    'ssd': 'solid state drive',
    'hdd': 'hard disk drive',
    'io': 'input output',
    'url': 'uniform resource locator',
    'http': 'hypertext transfer protocol',
    'https': 'hypertext transfer protocol secure',
    'html': 'hypertext markup language',
    'css': 'cascading style sheets',
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'javascript xml',
    'tsx': 'typescript xml',
    'json': 'javascript object notation',
    'xml': 'extensible markup language',
    'yaml': 'yaml ain t markup language',
    'sql': 'structured query language',
    'nosql': 'non relational database',
    'orm': 'object relational mapping',
    'ci': 'continuous integration',
    'cd': 'continuous deployment',
    'cicd': 'continuous integration and continuous deployment',
    'devops': 'development operations',
    'mlops': 'machine learning operations',
    'llmops': 'large language model operations',
    'saas': 'software as a service',
    'paas': 'platform as a service',
    'iaas': 'infrastructure as a service',
    'vpc': 'virtual private cloud',
    'cdn': 'content delivery network',
    'dns': 'domain name system',
    'ip': 'internet protocol',
    'tcp': 'transmission control protocol',
    'udp': 'user datagram protocol',
    'ssh': 'secure shell',
    'ssl': 'secure sockets layer',
    'tls': 'transport layer security',
    'jwt': 'json web token',
    'oauth': 'open authorization',
    'sso': 'single sign on',
    'mfa': 'multi factor authentication',
    '2fa': 'two factor authentication',
    'rbac': 'role based access control',
    'acl': 'access control list',
    'rest': 'representational state transfer',
    'grpc': 'google remote procedure call',
    'ws': 'websocket',
    'sse': 'server sent events',
    'pub sub': 'publish subscribe',
    'etl': 'extract transform load',
    'elt': 'extract load transform',
    'olap': 'online analytical processing',
    'oltp': 'online transaction processing',

    // ── Business & Finance ────────────────────────────────────────────────────
    'roi': 'return on investment',
    'kpi': 'key performance indicator',
    'otc': 'over the counter',
    'p&l': 'profit and loss',
    'b2b': 'business to business',
    'b2c': 'business to consumer',
    'vc': 've capital',
    'pe': 'private equity',
    'ebitda': 'earnings before interest taxes depreciation and amortization',
    'cagr': 'compound annual growth rate',
    'mrr': 'monthly recurring revenue',
    'arr': 'annual recurring revenue',
    'ltv': 'lifetime value',
    'cac': 'customer acquisition cost',
    'gmv': 'gross merchandise value',
}

// ─────────────────────────────────────────────────────────────────────────────
// Expander function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Expand all known abbreviations in a string.
 *
 * Matches whole words only (word boundary aware) and is case-insensitive.
 * Preserves the rest of the string exactly.
 *
 * Example:
 *   expandAbbreviations("LLMs power modern AI apps")
 *   → "large language models power modern artificial intelligence apps"
 */
export function expandAbbreviations(text: string): string {
    let result = text

    // Sort by length descending so longer keys match before shorter ones
    // (e.g. "rlhf" before "rl")
    const sorted = Object.entries(ABBREVIATIONS).sort(
        ([a], [b]) => b.length - a.length
    )

    for (const [abbr, full] of sorted) {
        // Escape special regex chars in the abbreviation key
        const escaped = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'gi')
        result = result.replace(pattern, full)
    }

    return result
}

/**
 * Check whether a string contains any known abbreviations.
 * Useful for deciding whether to expand before processing.
 */
export function hasAbbreviations(text: string): boolean {
    const lower = text.toLowerCase()
    return Object.keys(ABBREVIATIONS).some(abbr => {
        const escaped = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`).test(lower)
    })
}
