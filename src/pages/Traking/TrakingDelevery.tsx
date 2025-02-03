import React, { useEffect, useRef, useState } from "react";
import { db } from "../../FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Loader } from "@googlemaps/js-api-loader";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

const GOOGLE_MAPS_API_KEY = "AIzaSyALhgiV1Mi4IQdr-RPmCIFKli_7rhGDbm0"; // Replace with your actual API Key

const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: "weekly",
  libraries: ["places"], // Ensure consistency
});

interface DeliveryMan {
  id: string;
  name: string;
  location: { lat: number; lng: number } | null;
  photo: string;
  phone: string;
  hasActiveDelivery: boolean;
  totalDeliveries: number;
}

const TrakingDelevery: React.FC = () => {
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<google.maps.Map | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    const fetchDeliveryMen = async () => {
      console.log("🔍 Fetching delivery men from Firestore...");

      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        let data: DeliveryMan[] = [];

        for (const docSnap of querySnapshot.docs) {
          const userData = docSnap.data();
          if (userData.role !== "Delivery_Man" || !userData.location) continue;

          data.push({
            id: docSnap.id,
            name: userData.firstName || "Unknown",
            location: { lat: userData.location.latitude, lng: userData.location.longitude },
            photo: userData.photo_url || "https://i.imgur.com/YJ0VOGb.png",
            phone: userData.phone_number || "N/A",
            hasActiveDelivery: Math.random() > 0.5, // Random status for demo
            totalDeliveries: Math.floor(Math.random() * 20), // Replace with actual data if available
          });
        }

        console.log("🚀 Final Delivery Men List:", data);
        setDeliveryMen(data);
      } catch (error) {
        console.error("❌ Error fetching delivery men:", error);
      }

      setLoading(false);
    };

    fetchDeliveryMen();
  }, []);

  useEffect(() => {
    if (!loading && deliveryMen.length > 0 && !mapRef.current) {
      loader.load().then(() => {
        console.log("✅ Google Maps API Loaded!");

        const map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
          center: deliveryMen[0].location!,
          zoom: 12,
        });

        mapRef.current = map;

        // Initialize the InfoWindow
        infoWindowRef.current = new google.maps.InfoWindow();

        deliveryMen.forEach((deliveryMan) => {
          if (!deliveryMan.location) return;

          const marker = new google.maps.Marker({
            position: deliveryMan.location,
            map,
            title: deliveryMan.name,
            icon: {
              url: deliveryMan.hasActiveDelivery
                ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png" // Green for Active
                : "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Red for Inactive
              scaledSize: new google.maps.Size(40, 40),
            },
          });

          // Add click event to marker
          marker.addListener("click", () => {
            if (infoWindowRef.current) {
              infoWindowRef.current.setContent(`
                <div style="text-align:center;">
                  <img src="${deliveryMan.photo}" alt="${deliveryMan.name}" style="width:50px;height:50px;border-radius:50%;border:2px solid #fff;box-shadow:0px 0px 5px rgba(0,0,0,0.2);"/>
                  <h3 style="margin:5px 0;color:black;">${deliveryMan.name}</h3>
                  <p style="margin:2px 0;font-weight:bold;">📞 Phone: ${deliveryMan.phone}</p>
                  <p style="margin:2px 0;color:#555;">📦 Deliveries Made: ${deliveryMan.totalDeliveries}</p>
                </div>
              `);
              infoWindowRef.current.open(map, marker);
            }
          });
        });
      });
    }
  }, [loading, deliveryMen]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <Breadcrumb pageName="Track Delivery Men" />
      {loading ? (
        <p className="text-center text-lg font-semibold text-gray-600">Loading...</p>
      ) : (
        <div id="map" style={{ width: "100%", height: "500px" }} />
      )}
    </div>
  );
};

export default TrakingDelevery;
