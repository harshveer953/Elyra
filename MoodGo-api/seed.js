import dotenv from "dotenv"
import mongoose from "mongoose"
import Event from "./server/models/eventModel.js"
import User from "./server/models/userModel.js"
import Coupon from "./server/models/couponModel.js"
import bcrypt from "bcryptjs"

dotenv.config()

const SEED_EVENTS = [
  {
    title: "Arijit Singh — Live in Symphony Tour 2026",
    description: "Experience an enchanting evening of soulful melodies and orchestral arrangements with India's most beloved voice. Arijit Singh performs his greatest chartbusters backed by a 40-piece grand live symphony orchestra.",
    eventImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
    eventDate: "March 28, 2026",
    eventLocation: "DY Patil Stadium, Mumbai",
    eventArtistName: "Arijit Singh",
    totalSeats: 350,
    duration: "3.5 hours",
    ticketPrice: 1499,
    status: "upcoming",
    isActive: true
  },
  {
    title: "Sunburn Arena ft. Martin Garrix",
    description: "The #1 DJ in the world returns to Mumbai! Get ready for an explosive night with Martin Garrix featuring stadium-level laser shows, cutting-edge pyrotechnics, and relentless progressive house anthems.",
    eventImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
    eventDate: "April 15, 2026",
    eventLocation: "Jio World Garden, BKC, Mumbai",
    eventArtistName: "Martin Garrix",
    totalSeats: 500,
    duration: "4 hours",
    ticketPrice: 2499,
    status: "upcoming",
    isActive: true
  },
  {
    title: "Zakir Khan — Tathastu Live Comedy Tour",
    description: "Sakht Launda Zakir Khan brings his brand-new standup special packed with nostalgic storytelling, hilarious relationship insights, and poetic punchlines.",
    eventImage: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&q=80",
    eventDate: "April 05, 2026",
    eventLocation: "NCPA, Nariman Point, Mumbai",
    eventArtistName: "Zakir Khan",
    totalSeats: 200,
    duration: "2 hours",
    ticketPrice: 799,
    status: "upcoming",
    isActive: true
  },
  {
    title: "Coldplay — Music of the Spheres Experience",
    description: "The ultimate stadium rock concert with kinetic dance floors, solar-powered stages, and iconic tracks from Yellow to Fix You.",
    eventImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
    eventDate: "May 10, 2026",
    eventLocation: "Narendra Modi Stadium, Ahmedabad",
    eventArtistName: "Coldplay",
    totalSeats: 400,
    duration: "3 hours",
    ticketPrice: 3499,
    status: "upcoming",
    isActive: true
  },
  {
    title: "Anuv Jain — Guldasta Live Tour",
    description: "An intimate acoustic evening with Anuv Jain performing fan favorites Baarishein, Alag Aasman, Husn, and Mishri under the stars.",
    eventImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
    eventDate: "April 20, 2026",
    eventLocation: "Phoenix Marketcity, Bengaluru",
    eventArtistName: "Anuv Jain",
    totalSeats: 180,
    duration: "2.5 hours",
    ticketPrice: 999,
    status: "upcoming",
    isActive: true
  },
  {
    title: "Boiler Room Mumbai — Underground Techno Night",
    description: "The world's most raw underground music collective lands in Mumbai. 360-degree stage, raw industrial acoustics, and marathon techno sets.",
    eventImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80",
    eventDate: "April 30, 2026",
    eventLocation: "The Great Eastern Mills, Byculla, Mumbai",
    eventArtistName: "Boiler Room Collective",
    totalSeats: 250,
    duration: "6 hours",
    ticketPrice: 1299,
    status: "upcoming",
    isActive: true
  }
]

const SEED_COUPONS = [
  { couponCode: "ELYRA10", couponDiscount: 10, isActive: true },
  { couponCode: "WELCOME10", couponDiscount: 10, isActive: true },
  { couponCode: "FESTIVAL20", couponDiscount: 20, isActive: true },
  { couponCode: "MOOD20", couponDiscount: 20, isActive: true },
  { couponCode: "VIP50", couponDiscount: 50, isActive: true },
]

const seedDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI
    await mongoose.connect(uri)
    console.log("Connected to DB for seeding...")

    // 1. Create or Find Admin User
    let admin = await User.findOne({ email: "admin@elyra.app" })
    if (!admin) {
      const salt = bcrypt.genSaltSync(10)
      const hashedPassword = bcrypt.hashSync("admin123", salt)
      admin = await User.create({
        name: "Elyra Admin",
        email: "admin@elyra.app",
        phone: "9999999999",
        password: hashedPassword,
        isAdmin: true,
        isActive: true,
        credits: 50000
      })
      console.log("Admin user created: admin@elyra.app / admin123")
    }

    // 2. Insert Events if not exists
    const eventCount = await Event.countDocuments()
    if (eventCount === 0) {
      for (const ev of SEED_EVENTS) {
        await Event.create({
          ...ev,
          user: admin._id
        })
      }
      console.log(`Seeded ${SEED_EVENTS.length} events into MongoDB!`)
    } else {
      console.log(`Events already exist in DB (${eventCount} events).`)
    }

    // 3. Insert Coupons if not exists
    for (const coup of SEED_COUPONS) {
      const exist = await Coupon.findOne({ couponCode: coup.couponCode })
      if (!exist) {
        await Coupon.create(coup)
      }
    }
    console.log("Coupons verified in MongoDB!")

    console.log("Seeding complete!")
    process.exit(0)
  } catch (error) {
    console.error("Seeding failed:", error)
    process.exit(1)
  }
}

seedDB()
