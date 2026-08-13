import datetime
from sqlalchemy.orm import Session
from models import Grievance, StatusHistory, Officer

DEMO_GRIEVANCES = [
    # --- TELANGANA ---
    {
        "ticket_id": "GRV-2026-00101",
        "original_text": "మా ప్రాంతంలో గత మూడు రోజులుగా వీధి దీపాలు పనిచేయడం లేదు.",
        "language": "Telugu",
        "translation": "Street lights in our area have not been working for the past three days.",
        "category": "Electricity",
        "priority": "High",
        "department": "TSPDCL Electricity Department",
        "state": "Telangana",
        "city": "Hyderabad",
        "area": "Kukatpally Housing Board",
        "ward": "Ward 14 - Kukatpally",
        "landmark": "Near Phase 3 Bus Stop",
        "latitude": "17.4947",
        "longitude": "78.3996",
        "summary": "Multiple street lights non-functional creating evening safety hazards.",
        "suggested_action": "Deploy maintenance crew to replace dead bulbs and inspect fuse box.",
        "status": "Submitted"
    },
    {
        "ticket_id": "GRV-2026-00102",
        "original_text": "हमारे इलाके में पिछले तीन दिनों से पानी नहीं आ रहा है।",
        "language": "Hindi",
        "translation": "Water has not been supplied to our locality for the past three days.",
        "category": "Water",
        "priority": "High",
        "department": "HMWSSB Water Supply Board",
        "state": "Telangana",
        "city": "Hyderabad",
        "area": "Begumpet",
        "ward": "Ward 08 - Begumpet",
        "landmark": "Opposite Prakash Nagar Metro Station",
        "latitude": "17.4448",
        "longitude": "78.4661",
        "summary": "Complete disruption of municipal drinking water supply for 72 hours.",
        "suggested_action": "Send drinking water tanker and repair pressure valve on main line.",
        "status": "Assigned"
    },
    
    # --- ANDHRA PRADESH ---
    {
        "ticket_id": "GRV-2026-00201",
        "original_text": "మా వీధిలో తాగునీటి పైప్‌లైన్ పగిలి నీరు రోడ్డుపై వృధాగా పోతోంది.",
        "language": "Telugu",
        "translation": "Drinking water pipeline broke in our street and water is wasting on the road.",
        "category": "Water",
        "priority": "High",
        "department": "GVMC Water Supply Board",
        "state": "Andhra Pradesh",
        "city": "Visakhapatnam",
        "area": "RK Beach Road",
        "ward": "Ward 21 - Beach Zone",
        "landmark": "Near Submarine Museum",
        "latitude": "17.7144",
        "longitude": "83.3235",
        "summary": "Major pipeline burst causing high-volume potable water wastage on main thoroughfare.",
        "suggested_action": "Shut isolation valve and dispatch hydraulic pipe clamp repair team.",
        "status": "Under Investigation"
    },
    {
        "ticket_id": "GRV-2026-00202",
        "original_text": "విజయవాడ బెంజ్ సర్కిల్ వద్ద రహదారిపై గుంతలు పడి ట్రాఫిక్ స్తంభించిపోతోంది.",
        "language": "Telugu",
        "translation": "Deep potholes near Benz Circle Vijayawada are causing severe traffic jams.",
        "category": "Roads",
        "priority": "High",
        "department": "VMC Roads & Public Works",
        "state": "Andhra Pradesh",
        "city": "Vijayawada",
        "area": "Benz Circle",
        "ward": "Ward 12 - Benz Circle",
        "landmark": "Near Flyover Pillar 14",
        "latitude": "16.5062",
        "longitude": "80.6480",
        "summary": "Critical intersection road damage causing 2-km commuter bottlenecks during peak hours.",
        "suggested_action": "Schedule emergency asphalt levelling and traffic diversion.",
        "status": "Submitted"
    },
    {
        "ticket_id": "GRV-2026-00203",
        "original_text": "తిరుపతి బస్ స్టాండ్ వద్ద డ్రైనేజీ ఉప్పొంగి దుర్వాసన వస్తోంది.",
        "language": "Telugu",
        "translation": "Drainage overflowing at Tirupati bus stand causing unbearable stench.",
        "category": "Sanitation",
        "priority": "High",
        "department": "TMC Sanitation & Public Health",
        "state": "Andhra Pradesh",
        "city": "Tirupati",
        "area": "Central Bus Station",
        "ward": "Ward 05 - Railway Station Zone",
        "landmark": "Near Pilgrim Waiting Hall",
        "latitude": "13.6288",
        "longitude": "79.4192",
        "summary": "Overflowing sewer line near high footfall pilgrim transit complex.",
        "suggested_action": "Deploy high-pressure jetting machine and apply lime disinfectant.",
        "status": "Resolved",
        "rating": 5,
        "feedback_comment": "Excellent quick response by Tirupati Municipal Corporation team!"
    },

    # --- TAMIL NADU ---
    {
        "ticket_id": "GRV-2026-00301",
        "original_text": "எங்கள் பகுதியில் சாலை மிகவும் மோசமாக உள்ளது.",
        "language": "Tamil",
        "translation": "The road condition in our area is extremely poor with severe potholes.",
        "category": "Roads",
        "priority": "Medium",
        "department": "Greater Chennai Corporation Roads",
        "state": "Tamil Nadu",
        "city": "Chennai",
        "area": "T. Nagar",
        "ward": "Ward 112 - T. Nagar",
        "landmark": "Near Usman Road Flyover",
        "latitude": "13.0418",
        "longitude": "80.2341",
        "summary": "Commercial hub road surface damaged following heavy monsoon rains.",
        "suggested_action": "Patch pothole stretches and inspect underground cabling ducts.",
        "status": "Under Investigation"
    },

    # --- KARNATAKA ---
    {
        "ticket_id": "GRV-2026-00401",
        "original_text": "ಕುಡಿಯುವ ನೀರಿನ ಸರಬರಾಜು ಸರಿ ಇಲ್ಲ ಮತ್ತು ಕೊಳಚೆ ನೀರು ಬೆರೆತಿದೆ.",
        "language": "Kannada",
        "translation": "Drinking water supply is irregular and contaminated with sewage.",
        "category": "Water",
        "priority": "High",
        "department": "BWSSB Water Board",
        "state": "Karnataka",
        "city": "Bengaluru",
        "area": "Indiranagar",
        "ward": "Ward 80 - Hoysala Nagar",
        "landmark": "100 Feet Road 12th Main",
        "latitude": "12.9784",
        "longitude": "77.6408",
        "summary": "Contaminated municipal supply water reported by residential association.",
        "suggested_action": "Isolate contaminated water main line and sample water quality.",
        "status": "Under Investigation"
    },

    # --- MAHARASHTRA ---
    {
        "ticket_id": "GRV-2026-00501",
        "original_text": "कचऱ्याची गाडी चार दिवसांपासून आलेली नाही आणि रस्त्यावर कचरा साचला आहे.",
        "language": "Marathi",
        "translation": "Garbage van has not arrived for four days and waste has accumulated.",
        "category": "Sanitation",
        "priority": "High",
        "department": "BMC Solid Waste Management",
        "state": "Maharashtra",
        "city": "Mumbai",
        "area": "Dadar West",
        "ward": "Ward G/North - Dadar",
        "landmark": "Near Shivaji Park Gate 3",
        "latitude": "19.0269",
        "longitude": "72.8423",
        "summary": "Solid waste dumping accumulating outside residential housing society.",
        "suggested_action": "Send compactor truck immediately and issue warning to route supervisor.",
        "status": "Resolved",
        "rating": 4,
        "feedback_comment": "BMC truck arrived within 6 hours."
    }
]

DEMO_OFFICERS = [
    {"name": "Sri K. V. Rao", "username": "kvrao", "role": "Senior Ward Officer", "state": "Telangana", "city": "Hyderabad", "ward": "Ward 14 - Kukatpally"},
    {"name": "Smt. N. Sudha", "username": "nsudha", "role": "Zonal Officer", "state": "Andhra Pradesh", "city": "Visakhapatnam", "ward": "Ward 21 - Beach Zone"},
    {"name": "Sri M. Ramana", "username": "mramana", "role": "Municipal Officer", "state": "Andhra Pradesh", "city": "Vijayawada", "ward": "Ward 12 - Benz Circle"},
    {"name": "Sri P. Srinivas", "username": "psrinivas", "role": "Ward Inspector", "state": "Telangana", "city": "Hyderabad", "ward": "Ward 18 - Madhapur"},
]

def seed_db_if_empty(db: Session):
    count = db.query(Grievance).count()
    if count == 0:
        print("Seeding multi-state demo grievances into database...")
        now = datetime.datetime.utcnow()
        for idx, g in enumerate(DEMO_GRIEVANCES):
            days_ago = 3 if idx in [0, 2] else (1 if idx % 2 == 0 else 0)
            created = now - datetime.timedelta(days=days_ago, hours=idx * 2)
            
            grievance = Grievance(
                ticket_id=g["ticket_id"],
                original_text=g["original_text"],
                language=g["language"],
                translation=g["translation"],
                category=g["category"],
                priority=g["priority"],
                department=g["department"],
                state=g.get("state", "Telangana"),
                city=g.get("city", "Hyderabad"),
                area=g["area"],
                ward=g.get("ward", "Ward 12 - Central"),
                landmark=g["landmark"],
                latitude=g.get("latitude", "17.3850"),
                longitude=g.get("longitude", "78.4867"),
                summary=g["summary"],
                suggested_action=g["suggested_action"],
                status=g["status"],
                rating=g.get("rating"),
                feedback_comment=g.get("feedback_comment"),
                created_at=created,
                updated_at=created
            )
            db.add(grievance)
            db.flush()

            # Status history entry
            hist1 = StatusHistory(
                grievance_id=grievance.id,
                status="Submitted",
                comment="Grievance logged via JanSeva AI Multilingual Platform.",
                timestamp=created
            )
            db.add(hist1)

            if g["status"] in ["Assigned", "Under Investigation", "Resolved"]:
                hist2 = StatusHistory(
                    grievance_id=grievance.id,
                    status="Assigned",
                    comment=f"AI routed to {g['department']}.",
                    timestamp=created + datetime.timedelta(hours=1)
                )
                db.add(hist2)

            if g["status"] in ["Under Investigation", "Resolved"]:
                hist3 = StatusHistory(
                    grievance_id=grievance.id,
                    status="Under Investigation",
                    comment="Municipal officer inspected location.",
                    timestamp=created + datetime.timedelta(hours=4)
                )
                db.add(hist3)

            if g["status"] == "Resolved":
                hist4 = StatusHistory(
                    grievance_id=grievance.id,
                    status="Resolved",
                    comment="Grievance resolved and verified with citizen.",
                    timestamp=created + datetime.timedelta(hours=18)
                )
                db.add(hist4)

        # Seed Officers
        for off in DEMO_OFFICERS:
            officer = Officer(
                name=off["name"],
                username=off["username"],
                role=off["role"],
                state=off["state"],
                city=off["city"],
                ward=off["ward"]
            )
            db.add(officer)

        db.commit()
        print(f"Successfully seeded {len(DEMO_GRIEVANCES)} multi-state grievances and {len(DEMO_OFFICERS)} officers!")
