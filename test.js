// Run with: node test-gemini.js YOUR_API_KEY_HERE
const key = process.argv[2]
if (!key) { console.error('Usage: node test-gemini.js AIzaSyDR2p72-5KmLU_eX0e0NDaPmosW2biYFjU '); process.exit(1) }

fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Say "API key works" and nothing else.' }] }]
  })
})
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      console.log('❌ FAILED:', data.error.status)
      console.log('   Reason:', data.error.message?.slice(0, 120))
    } else {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      console.log('✅ SUCCESS:', text)
    }
  })