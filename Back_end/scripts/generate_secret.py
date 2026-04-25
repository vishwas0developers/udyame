import secrets
import string

def generate_secret(length=64):
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for i in range(length))

if __name__ == "__main__":
    print("\n--- UDYAME SECURE KEY GENERATOR ---")
    print(f"Generated Key: {generate_secret()}")
    print("-----------------------------------\n")
    print("Keep this key private. Use it for SECRET_KEY in your .env.production file.")
