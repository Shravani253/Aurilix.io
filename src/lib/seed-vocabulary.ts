/**
 * scripts/seed-vocabulary.ts
 *
 * Pre-seeds vocabulary with common English + tech/AI/blockchain words.
 * Safe to re-run — skips existing words.
 *
 * Run:  npx tsx scripts/seed-vocabulary.ts
 */

import { registerWord, loadVocabulary } from '../src/lib/vocabulary'

const NOUNS = [
    'person', 'people', 'man', 'woman', 'child', 'friend', 'family', 'doctor', 'nurse', 'patient',
    'teacher', 'student', 'developer', 'engineer', 'designer', 'leader', 'founder', 'investor',
    'place', 'city', 'country', 'world', 'area', 'building', 'home', 'school', 'hospital',
    'thing', 'object', 'item', 'product', 'tool', 'device', 'machine', 'car', 'book', 'phone',
    'time', 'day', 'year', 'moment', 'life', 'death', 'mind', 'heart', 'memory', 'knowledge',
    'system', 'process', 'plan', 'idea', 'fact', 'problem', 'solution', 'result', 'goal',
    'data', 'model', 'token', 'blockchain', 'network', 'node', 'wallet', 'contract', 'agent',
    'llm', 'transformer', 'embedding', 'vector', 'prompt', 'context', 'output', 'input',
    'surgery', 'recovery', 'procedure', 'treatment', 'operation', 'therapy',
    'money', 'market', 'value', 'cost', 'profit', 'revenue', 'fund', 'investment',
]

const VERBS = [
    'be', 'have', 'do', 'say', 'get', 'make', 'go', 'know', 'take', 'see', 'come', 'think',
    'look', 'want', 'give', 'use', 'find', 'tell', 'ask', 'feel', 'try', 'leave', 'keep',
    'learn', 'change', 'lead', 'understand', 'follow', 'stop', 'create', 'build', 'start',
    'write', 'read', 'run', 'eat', 'drink', 'work', 'study', 'teach', 'travel', 'talk',
    'generate', 'train', 'deploy', 'execute', 'process', 'encode', 'decode', 'tokenize',
    'stake', 'mint', 'burn', 'transfer', 'swap', 'vote', 'validate', 'sign', 'verify',
    'undergo', 'perform', 'treat', 'recover', 'operate', 'diagnose', 'prescribe',
]

const ADJECTIVES = [
    'big', 'small', 'large', 'good', 'bad', 'new', 'old', 'fast', 'slow', 'strong', 'weak',
    'important', 'critical', 'urgent', 'significant', 'primary', 'secondary', 'main',
    'decentralized', 'distributed', 'encrypted', 'secure', 'public', 'private', 'open',
    'intelligent', 'artificial', 'neural', 'deep', 'supervised', 'generative', 'pretrained',
    'medical', 'clinical', 'surgical', 'postoperative', 'chronic', 'acute', 'stable',
]

const ADVERBS = [
    'very', 'really', 'quite', 'just', 'also', 'still', 'already', 'always', 'never',
    'often', 'usually', 'clearly', 'quickly', 'slowly', 'easily', 'urgently', 'critically',
    'automatically', 'efficiently', 'securely', 'transparently', 'deterministically',
]

async function seed() {
    console.log('Seeding vocabulary...\n')
    const before = loadVocabulary().nextId - 1
    let processed = 0

    const register = (words: string[], pos: 'noun' | 'verb' | 'adjective' | 'adverb') => {
        for (const word of words) {
            const w = word.trim().toLowerCase()
            if (w) { registerWord(w, pos); processed++ }
        }
    }

    register(NOUNS, 'noun')
    register(VERBS, 'verb')
    register(ADJECTIVES, 'adjective')
    register(ADVERBS, 'adverb')

    const after = loadVocabulary().nextId - 1
    console.log(`Done. Words processed: ${processed}, new words added: ${after - before}, total: ${after}`)
}

seed().catch(console.error)