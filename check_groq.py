import os
import sys

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

if not api_key or api_key.startswith("paste-"):
    print("GROQ_API_KEY is missing in your .env file.")
    sys.exit(1)

client = Groq(api_key=api_key)

print("Connecting to Groq ...")
try:
    available = sorted(m.id for m in client.models.list().data)
except Exception as error:
    print("Could not connect to Groq:", error)
    print("Check that the key in .env is copied correctly (starts with gsk_).")
    sys.exit(1)

print("Your key works. Models you can use right now:")
for name in available:
    print("  -", name)

if model not in available:
    print(f"\nThe model in your .env ({model}) is NOT available.")
    print("Choose a name from the list above and set it in .env, like:")
    print("GROQ_MODEL=name-from-the-list")
    sys.exit(1)

print(f"\nAsking {model} to say hello ...")
reply = client.chat.completions.create(
    model=model,
    messages=[{"role": "user",
               "content": "Say hello to a college student in one short, friendly sentence."}],
    max_tokens=400,
)
print("Reply:", reply.choices[0].message.content or "(empty reply)")
print("\nGroq is ready for the UniMind chatbot.")