from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AuraByShenoi API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aurabyshenoi.netlify.app",
        "https://aurabyshenoi.com",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URI)
db = client.artist_portfolio

# Pydantic models
class NewsletterSubscription(BaseModel):
    email: EmailStr
    source: str = "homepage"

class ContactSubmission(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    message: str = Field(..., min_length=10, max_length=1000)
    artworkReference: Optional[str] = None

class NewsletterResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class ContactResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

# Routes
@app.get("/")
async def root():
    return {"message": "AuraByShenoi API", "status": "running"}

@app.get("/health")
async def health_check():
    try:
        # Check database connection
        await client.admin.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@app.post("/api/newsletter/subscribe", response_model=NewsletterResponse)
async def subscribe_newsletter(subscription: NewsletterSubscription):
    try:
        # Check if email already exists
        existing = await db.newsletters.find_one({"email": subscription.email.lower()})
        if existing:
            raise HTTPException(
                status_code=409,
                detail="This email is already subscribed to our newsletter"
            )
        
        # Create subscription
        newsletter_doc = {
            "email": subscription.email.lower(),
            "source": subscription.source,
            "status": "active",
            "subscribedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = await db.newsletters.insert_one(newsletter_doc)
        
        return NewsletterResponse(
            success=True,
            message="Successfully subscribed to newsletter!",
            data={
                "email": subscription.email.lower(),
                "subscribedAt": newsletter_doc["subscribedAt"].isoformat()
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to subscribe to newsletter: {str(e)}"
        )

@app.post("/api/contact", response_model=ContactResponse)
async def submit_contact(contact: ContactSubmission):
    try:
        # Generate contact number
        count = await db.contacts.count_documents({})
        contact_number = f"CNT{str(count + 1).zfill(6)}"
        
        # Create contact document
        contact_doc = {
            "contactNumber": contact_number,
            "name": contact.name.strip(),
            "email": contact.email.lower(),
            "phone": contact.phone.strip() if contact.phone else None,
            "message": contact.message.strip(),
            "artworkReference": contact.artworkReference,
            "status": "new",
            "submittedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = await db.contacts.insert_one(contact_doc)
        
        return ContactResponse(
            success=True,
            message="Thank you for contacting us! We'll get back to you soon.",
            data={
                "contactNumber": contact_number,
                "submittedAt": contact_doc["submittedAt"].isoformat()
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit contact form: {str(e)}"
        )

@app.get("/api/paintings")
async def get_paintings(featured: Optional[bool] = None, limit: Optional[int] = None):
    try:
        query = {}
        if featured is not None:
            query["featured"] = featured
        
        cursor = db.paintings.find(query)
        if limit:
            cursor = cursor.limit(limit)
        
        paintings = await cursor.to_list(length=limit or 100)
        
        # Convert ObjectId to string
        for painting in paintings:
            painting["_id"] = str(painting["_id"])
        
        return {"success": True, "data": paintings}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch paintings: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
