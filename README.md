🧬 VibeOS // A Nervous System for Your Computer

"Productivity tools manage your tasks. VibeOS manages your biology."

VibeOS is a generative, adaptive cognitive interface built for the Maximally Vibe-a-thon. It acts as a biological abstraction layer between the human and the machine, using Generative AI (Google Gemini), 3D Physics (Three.js), and real-time Audio Synthesis (Web Audio API) to create an environment that mirrors and regulates your mental state.

⚡️ The Core Loop

Neural Sync: You input your current cognitive state (e.g., "I'm drowning in bugs" or "Locking in with coffee").

Sentiment Decoding: Google Gemini parses your syntax and compiles it into a strict JSON schema of physical and auditory parameters.

Physical Manifestation: The Vibe Orb (a 3D entity built in Three.js) morphs its distortion, viscosity, and color based on the AI's vectors.

Acoustic Synthesis: The OS generates a real-time drone using math, not MP3s. It creates waveforms that shift pitch and timbre to match your "Vibe."

🔮 Features

1. The Vibe Orb (The Body)

A central 3D fluid entity rendered with React Three Fiber. It uses MeshDistortMaterial to visually represent your focus.

Panic State: Jagged, red, high-frequency wobble.

Flow State: Smooth, neon, rhythmic pulse.

2. Generative Drones (The Voice)

Built entirely with the Web Audio API.

No static assets: Every sound is a real-time mathematical calculation.

Cinematic Filtering: Uses Biquad Filter Nodes to turn harsh waveforms into deep, cinematic growls or soothing hums.

3. The "Matrix" Decryption

Text doesn't just "load." It decrypts. Using a custom scrambling hook, AI responses cycle through random characters before locking into place, providing a visceral "decoding" feel.

4. Brain Dump Tool 🧠

A digital therapy tool. Type your anxieties into the dump box—if you stop typing for 5 seconds, the text blurs and vanishes. Write it to let it go.

5. Focus Physics (Timer)

A Pomodoro timer integrated into the 3D physics. As time passes, the Orb physically shrinks, creating an intuitive sense of time passing without the stress of a ticking clock.

🛠 Tech Stack

Layer

Technology

Framework

Next.js 15 (App Router)

Intelligence

Google Gemini 1.5 Flash / 2.5

Visuals

Three.js / React Three Fiber

Sound

Web Audio API (Synthesizers)

State

Zustand

Aesthetics

Raw CSS Glassmorphism

🚀 Getting Started

Clone the neural link:

git clone [https://github.com/Shyamistic/vibe-os.git](https://github.com/Shyamistic/vibe-os.git)
cd vibe-os


Install dependencies:

npm install


Configure the Brain:
Create a .env.local file and add your Gemini API Key:

GEMINI_API_KEY=your_key_here


Boot the system:

npm run dev


Access the interface:
Open http://localhost:3000 and click the Speaker Icon to initiate the bio-audio link.

 Roadmap

VibeOS is designed to scale into a full cognitive environment:

[ ] Spotify Pulse Sync: Orb throbbing to your music's BPM.

[ ] IoT Light Integration: Room lights changing color to match the Orb.

[ ] Binaural Beats: Audio generation to induce specific brainwave states (Alpha/Theta).

[ ] Biometric Hook: Heart-rate-to-vibe automation.

🏆 Hackathon Credits

Built in 48 hours for the Maximally Vibe-a-thon.

Judge's Note: If the Gemini API hits a quota limit, the system features a custom Hybrid Fallback Engine that switches to local keyword sentiment analysis—the vibe never breaks.

VibeOS // Made for the people who code because it feels good.
