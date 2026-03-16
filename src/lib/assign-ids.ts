/**
 * scripts/assign-ids.ts
 *
 * Manually assign specific words to specific IDs.
 * After running: ◯@2 = pen, ◯@344 = teacup, ╱@100 = write etc.
 *
 * Run:  npx tsx scripts/assign-ids.ts
 */

import { registerWordWithId } from '../src/lib/vocabulary'

const MANUAL: Array<[number, string, 'noun' | 'verb' | 'adjective' | 'adverb' | 'other']> = [
    // Add your custom mappings here:
    // [id,  word,       pos]
    [2, 'pen', 'noun'],
    [3, 'paper', 'noun'],
    [4, 'book', 'noun'],
    [5, 'table', 'noun'],
    [100, 'write', 'verb'],
    [101, 'read', 'verb'],
    [102, 'run', 'verb'],
    [103, 'generate', 'verb'],
    [200, 'fast', 'adjective'],
    [201, 'critical', 'adjective'],
    [344, 'teacup', 'noun'],
    [345, 'surgery', 'noun'],
    [346, 'patient', 'noun'],
    [347, 'recovery', 'noun'],
]

async function assign() {
    console.log('Assigning manual vocabulary IDs...\n')
    let ok = 0, skip = 0, err = 0
    for (const [id, word, pos] of MANUAL) {
        try {
            registerWordWithId(id, word, pos)
            console.log(`  @${String(id).padEnd(4)} = "${word}" (${pos})`)
            ok++
        } catch (e: any) {
            if (e.message?.includes('already assigned') && e.message?.includes(word)) { skip++ }
            else { console.warn(`  WARN @${id}: ${e.message}`); err++ }
        }
    }
    console.log(`\nDone. Assigned: ${ok}, already correct: ${skip}, errors: ${err}`)
}

assign().catch(console.error)