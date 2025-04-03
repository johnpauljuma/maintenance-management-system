"use client";

import { useState, useRef, useEffect } from "react";
import { Form, Input, Button, Modal } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { GoogleMap, Marker, Autocomplete, useLoadScript } from "@react-google-maps/api";

const libraries = ["places"];

const LocationPicker = () => {
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [location, setLocation] = useState({ lat: -1.286389, lng: 36.817223, address: "" });
    const [markerPosition, setMarkerPosition] = useState({ lat: -1.286389, lng: 36.817223 });
    const autocompleteRef = useRef(null);
    const [apiReady, setApiReady] = useState(false); // New state variable

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    useEffect(() => {
        if (isLoaded && !loadError) {
            setApiReady(true);
        }
    }, [isLoaded, loadError]); // Runs only when `isLoaded` or `loadError` changes    

    if (loadError) {
        console.error("Error loading Google Maps API:", loadError);
    }

    const handlePlaceSelect = () => {
        if (!autocompleteRef.current) return;
        const place = autocompleteRef.current.getPlace();
        if (!place || !place.geometry) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerPosition({ lat, lng });
        setLocation({ lat, lng, address: place.formatted_address || "" });
    };

    const handleMapClick = (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setMarkerPosition({ lat, lng });

        // Reverse geocode to get address
        if (window.google && window.google.maps) { // check if google maps api is loaded.
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === "OK" && results[0]) {
                    setLocation({ lat, lng, address: results[0].formatted_address });
                }
            });
        }
    };

    return (
        <div>
            <Form.Item label="Location">
                <Input value={location.address} placeholder="Select location" readOnly />
                <Button
                    icon={<EnvironmentOutlined />}
                    onClick={() => setIsMapModalOpen(true)}
                    style={{ marginTop: 8 }}
                >
                    Open Map
                </Button>
            </Form.Item>

            <Modal
                title="Select Location"
                open={isMapModalOpen}
                onCancel={() => setIsMapModalOpen(false)}
                onOk={() => setIsMapModalOpen(false)}
                width={600}
            >
                {!apiReady ? ( // Use apiReady instead of isLoaded
                    <p>Loading map...</p>
                ) : (
                    <div style={{ position: "relative" }}>
                        {/* Floating search bar */}
                        <div
                            style={{
                                position: "absolute",
                                top: "10px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                zIndex: 1000,
                                background: "white",
                                padding: "10px",
                                borderRadius: "25px",
                                boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
                                width: "80%",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            {apiReady && ( // Use apiReady instead of isLoaded
                                <Autocomplete
                                    onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                                    onPlaceChanged={handlePlaceSelect}
                                >
                                    {/* FIX: Autocomplete requires a child element */}
                                    <input type="text" placeholder="Search location" style={{ width: "100%", padding: "8px", border: "none", outline: "none" }} />
                                </Autocomplete>
                            )}
                        </div>

                        {/* Google Map */}
                        <GoogleMap
                            mapContainerStyle={{ width: "100%", height: "400px" }}
                            center={markerPosition}
                            zoom={15}
                            onClick={handleMapClick}
                        >
                            <Marker position={markerPosition} />
                        </GoogleMap>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LocationPicker;