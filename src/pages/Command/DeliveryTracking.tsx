import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";

interface DeliveryTrackingProps {
  clientLocation: { lat: number; lng: number };
  deliveryStartLocation: { lat: number; lng: number };
}

const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({ clientLocation, deliveryStartLocation }) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  useEffect(() => {
    if (!isLoaded || !window.google) return; // Ensure Google Maps is loaded

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: deliveryStartLocation,
        destination: clientLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error("Error fetching directions:", status);
        }
      }
    );
  }, [clientLocation, deliveryStartLocation, isLoaded]);

  return (
    <LoadScript googleMapsApiKey="AIzaSyALhgiV1Mi4IQdr-RPmCIFKli_7rhGDbm0" onLoad={handleLoad}>
      {isLoaded ? (
        <GoogleMap mapContainerStyle={{ width: "100%", height: "500px" }} zoom={12} center={clientLocation}>
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      ) : (
        <p>Loading Map...</p>
      )}
    </LoadScript>
  );
};

export default DeliveryTracking;
