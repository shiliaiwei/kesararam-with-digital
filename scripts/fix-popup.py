import re

path = 'v:/kesararamwithdigital/src/components/learn/sign-detail-popup.tsx'

with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add loading state after playing state
c = c.replace(
    'const [playing, setPlaying] = useState(false);',
    'const [playing, setPlaying] = useState(false);\n  const [loading, setLoading] = useState(false);',
    1
)

# 2. Replace toggleAudio
old = (
    '  const toggleAudio = () => {\n'
    '    if (playing) {\n'
    '      audioRef.current?.pause();\n'
    '      if (audioRef.current) audioRef.current.currentTime = 0;\n'
    '      setPlaying(false);\n'
    '    } else {\n'
    '      audioRef.current?.play();\n'
    '      setPlaying(true);\n'
    '    }\n'
    '  };'
)
new = (
    '  const toggleAudio = () => {\n'
    '    if (playing) {\n'
    '      audioRef.current?.pause();\n'
    '      if (audioRef.current) audioRef.current.currentTime = 0;\n'
    '      setPlaying(false);\n'
    '      setLoading(false);\n'
    '    } else {\n'
    '      const el = audioRef.current;\n'
    '      if (!el) return;\n'
    '      if (el.readyState >= 3) {\n'
    '        el.currentTime = 0;\n'
    '        el.play();\n'
    '        setPlaying(true);\n'
    '      } else {\n'
    '        setLoading(true);\n'
    '        el.load();\n'
    '        el.oncanplaythrough = () => {\n'
    '          el.play();\n'
    '          setLoading(false);\n'
    '          setPlaying(true);\n'
    '          el.oncanplaythrough = null;\n'
    '        };\n'
    '      }\n'
    '    }\n'
    '  };'
)
if old in c:
    c = c.replace(old, new, 1)
    print('toggleAudio replaced')
else:
    print('toggleAudio NOT found')

# 3. Replace audio button block
start = c.find('{audioUrl && (')
end = c.find(')}', start) + 2
print(f'Button block: {start} to {end}')

new_btn = (
    '{audioUrl && (\n'
    '            <div className="px-5 pb-5">\n'
    '              <button\n'
    '                onClick={toggleAudio}\n'
    '                disabled={loading}\n'
    '                className={`w-full py-3 font-black text-sm inline-flex items-center justify-center gap-2.5 border-2 border-black select-none ${\n'
    '                  loading ? "bg-zinc-100 text-zinc-400 cursor-wait"\n'
    '                  : playing ? "bg-black text-yellow-400 shadow-[4px_4px_0_#ca8a04]"\n'
    '                  : "bg-white text-black shadow-[4px_4px_0_#000] hover:bg-yellow-400 hover:shadow-[4px_4px_0_#ca8a04]"\n'
    '                }`}\n'
    '                style={kf}\n'
    '              >\n'
    '                {loading ? (\n'
    '                  <>\n'
    '                    <span className="flex gap-1 items-center">\n'
    '                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />\n'
    '                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />\n'
    '                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />\n'
    '                    </span>\n'
    '                    {isKh ? "Loading..." : "Loading audio..."}\n'
    '                  </>\n'
    '                ) : playing ? (\n'
    '                  <>\n'
    '                    <span className="flex gap-0.5 items-end h-4">\n'
    '                      {[60,100,75,90].map((h,i) => (\n'
    '                        <span key={i} className="w-1 bg-yellow-400 rounded-sm animate-pulse"\n'
    '                          style={{ height: h+"%", animationDelay: i*100+"ms" }} />\n'
    '                      ))}\n'
    '                    </span>\n'
    '                    {isKh ? "ចុចដើម្បីឈប់" : "Tap to stop"}\n'
    '                  </>\n'
    '                ) : (\n'
    '                  <><Volume2 size={16} />{isKh ? "ចាក់សំឡេង" : "Play Audio"}</>\n'
    '                )}\n'
    '              </button>\n'
    '            </div>\n'
    '          )}'
)

c = c[:start] + new_btn + c[end:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('done')
