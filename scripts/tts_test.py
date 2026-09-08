import asyncio, os, sys
sys.path.insert(0, os.path.join(os.getcwd(),'tools','pylibs'))
import edge_tts
from imageio_ffmpeg import get_ffmpeg_exe
print('ffmpeg:', get_ffmpeg_exe())
async def main():
    for voice in ['en-GB-RyanNeural','en-GB-SoniaNeural','en-GB-LibbyNeural','en-GB-ThomasNeural']:
        out = f'audio_tmp/test_{voice}.mp3'
        c = edge_tts.Communicate("No way! OpenAI just dropped a brand new model, and it is seriously fast.", voice=voice, rate="-8%")
        await c.save(out)
        print(voice, os.path.getsize(out), 'bytes')
asyncio.run(main())
