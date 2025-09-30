import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "your_secret_key")
    # MongoDB Atlas URI
    MONGO_URI = "mongodb+srv://parthivvanapalli:<your-password-here>@stivan.mjhcfxg.mongodb.net/stivan?retryWrites=true&w=majority"

# Export the MONGO_URI at module level
MONGO_URI = Config.MONGO_URI
