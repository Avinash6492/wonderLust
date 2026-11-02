const data = [
  {
    title: "Sample beach stay near Baga Beach",
    description: "A sample listing for previewing stays around Baga Beach in North Goa. The property details and nightly rate are demonstration content, not a live booking offer.",
    image: { url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80", fileName: "demo-baga" },
    price: 4200,
    location: "Baga, Goa",
    country: "India",
    category: "Beachfront",
    geometry: { type: "Point", coordinates: [73.7517, 15.5553] }
  },
  {
    title: "Sample coastal stay near Palolem Beach",
    description: "A sample listing for the quieter South Goa coastline near Palolem. Features and rate are illustrative and should be replaced with verified host information before accepting guests.",
    image: { url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80", fileName: "demo-palolem" },
    price: 5200,
    location: "Palolem, Goa",
    country: "India",
    category: "Beachfront",
    geometry: { type: "Point", coordinates: [74.0167, 15.0100] }
  },
  {
    title: "Sample mountain stay in Old Manali",
    description: "A sample mountain listing in Old Manali, Himachal Pradesh. The nightly amount is an example rate; confirm the real property, amenities, and availability with a host.",
    image: { url: "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?auto=format&fit=crop&w=1200&q=80", fileName: "demo-manali" },
    price: 3500,
    location: "Old Manali, Himachal Pradesh",
    country: "India",
    category: "Mountains",
    geometry: { type: "Point", coordinates: [77.1855, 32.2540] }
  },
  {
    title: "Sample heritage stay near Hawa Mahal",
    description: "A sample city stay listing in Jaipur near the historic Hawa Mahal district. This example is for browsing and pricing previews; the property details are not a verified hotel offer.",
    image: { url: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80", fileName: "demo-jaipur" },
    price: 3900,
    location: "Jaipur, Rajasthan",
    country: "India",
    category: "Amazing views",
    geometry: { type: "Point", coordinates: [75.8267, 26.9239] }
  },
  {
    title: "Sample riverside stay near Assi Ghat",
    description: "A sample listing for the Assi Ghat area of Varanasi. The location is real; the property description and nightly rate are illustrative rather than a reservation offer.",
    image: { url: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80", fileName: "demo-varanasi" },
    price: 2800,
    location: "Varanasi, Uttar Pradesh",
    country: "India",
    category: "Amazing views",
    geometry: { type: "Point", coordinates: [83.0062, 25.2881] }
  },
  {
    title: "Sample heritage stay in Fort Kochi",
    description: "A sample listing for Fort Kochi, Kerala, near the historic harbour area. Replace the sample property information with a host-verified listing before offering stays.",
    image: { url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80", fileName: "demo-kochi" },
    price: 3100,
    location: "Fort Kochi, Kerala",
    country: "India",
    category: "Countryside",
    geometry: { type: "Point", coordinates: [76.2424, 9.9650] }
  },
  {
    title: "Sample lake-view stay near Lake Pichola",
    description: "A sample listing in Udaipur close to Lake Pichola. The stay name, property details, and rate are example content and do not represent a live accommodation listing.",
    image: { url: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=1200&q=80", fileName: "demo-udaipur" },
    price: 4900,
    location: "Udaipur, Rajasthan",
    country: "India",
    category: "Amazing views",
    geometry: { type: "Point", coordinates: [73.6805, 24.5764] }
  },
  {
    title: "Sample riverside stay in Tapovan",
    description: "A sample listing near the Ganges in Tapovan, Rishikesh. Features and nightly rate are illustrative; use verified host-provided details for a real offer.",
    image: { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", fileName: "demo-rishikesh" },
    price: 3000,
    location: "Tapovan, Rishikesh",
    country: "India",
    category: "Mountains",
    geometry: { type: "Point", coordinates: [78.3160, 30.1260] }
  }
];

module.exports = { data };
