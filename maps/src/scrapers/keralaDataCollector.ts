import axios from 'axios';

export interface ViewPoint {
  name: string;
  type: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  location?: string;
  district?: string;
  source?: string;
}

export class KeralaTourismDataCollector {
  private viewPoints: ViewPoint[] = [];

  // Comprehensive manual dataset of Kerala viewpoints
  private getComprehensiveKeralaViewpoints(): ViewPoint[] {
    return [
      // Waterfalls
      {
        name: "Athirappilly Falls",
        type: "waterfall",
        coordinates: { latitude: 10.2851, longitude: 76.5700 },
        description: "Kerala's largest waterfall, known as the Niagara of India",
        location: "Athirappilly, Thrissur",
        district: "Thrissur",
        source: "Manual Entry"
      },
      {
        name: "Vazhachal Falls",
        type: "waterfall", 
        coordinates: { latitude: 10.3167, longitude: 76.5667 },
        description: "Beautiful waterfall near Athirappilly",
        location: "Vazhachal, Thrissur",
        district: "Thrissur",
        source: "Manual Entry"
      },
      {
        name: "Meenmutty Falls",
        type: "waterfall",
        coordinates: { latitude: 11.5564, longitude: 76.1442 },
        description: "Three-tiered waterfall in Wayanad",
        location: "Wayanad",
        district: "Wayanad",
        source: "Manual Entry"
      },
      {
        name: "Soochipara Falls",
        type: "waterfall",
        coordinates: { latitude: 11.5167, longitude: 76.1333 },
        description: "Three-tier waterfall also known as Sentinel Rock Waterfalls",
        location: "Wayanad",
        district: "Wayanad", 
        source: "Manual Entry"
      },
      {
        name: "Palaruvi Falls",
        type: "waterfall",
        coordinates: { latitude: 8.9167, longitude: 77.0833 },
        description: "Waterfall flowing over rocks in the Western Ghats",
        location: "Kollam",
        district: "Kollam",
        source: "Manual Entry"
      },
      {
        name: "Thommankuthu Falls",
        type: "waterfall",
        coordinates: { latitude: 9.6833, longitude: 76.8167 },
        description: "Seven-step waterfall in Idukki",
        location: "Thodupuzha, Idukki",
        district: "Idukki",
        source: "Manual Entry"
      },
      {
        name: "Ayyappacoil Falls",
        type: "waterfall",
        coordinates: { latitude: 8.8167, longitude: 77.0833 },
        description: "Picturesque waterfall in Kollam district",
        location: "Kollam",
        district: "Kollam",
        source: "Manual Entry"
      },

      // Beaches
      {
        name: "Kovalam Beach",
        type: "beach",
        coordinates: { latitude: 8.4004, longitude: 76.9784 },
        description: "Famous crescent-shaped beach with lighthouse",
        location: "Kovalam, Thiruvananthapuram",
        district: "Thiruvananthapuram",
        source: "Manual Entry"
      },
      {
        name: "Varkala Beach",
        type: "beach",
        coordinates: { latitude: 8.7379, longitude: 76.7166 },
        description: "Cliff beach with natural springs",
        location: "Varkala, Thiruvananthapuram",
        district: "Thiruvananthapuram",
        source: "Manual Entry"
      },
      {
        name: "Cherai Beach",
        type: "beach",
        coordinates: { latitude: 10.1059, longitude: 76.1789 },
        description: "Golden sand beach near Kochi",
        location: "Cherai, Ernakulam",
        district: "Ernakulam",
        source: "Manual Entry"
      },
      {
        name: "Marari Beach",
        type: "beach",
        coordinates: { latitude: 9.6167, longitude: 76.2833 },
        description: "Pristine beach in Alappuzha",
        location: "Mararikulam, Alappuzha",
        district: "Alappuzha",
        source: "Manual Entry"
      },
      {
        name: "Bekal Beach",
        type: "beach",
        coordinates: { latitude: 12.3833, longitude: 75.0333 },
        description: "Beach with historic Bekal Fort",
        location: "Bekal, Kasaragod",
        district: "Kasaragod",
        source: "Manual Entry"
      },
      {
        name: "Muzhappilangad Beach",
        type: "beach",
        coordinates: { latitude: 11.7667, longitude: 75.4833 },
        description: "Drive-in beach, longest in Kerala",
        location: "Kannur",
        district: "Kannur",
        source: "Manual Entry"
      },
      {
        name: "Shanghumukham Beach",
        type: "beach",
        coordinates: { latitude: 8.4667, longitude: 76.9167 },
        description: "Beach near Thiruvananthapuram airport",
        location: "Thiruvananthapuram",
        district: "Thiruvananthapuram",
        source: "Manual Entry"
      },

      // Backwaters
      {
        name: "Alleppey Backwaters",
        type: "backwaters",
        coordinates: { latitude: 9.4981, longitude: 76.3388 },
        description: "Network of lagoons and lakes forming backwaters",
        location: "Alappuzha",
        district: "Alappuzha",
        source: "Manual Entry"
      },
      {
        name: "Kumarakom Backwaters",
        type: "backwaters",
        coordinates: { latitude: 9.6167, longitude: 76.4333 },
        description: "Backwater destination on Vembanad Lake",
        location: "Kumarakom, Kottayam",
        district: "Kottayam",
        source: "Manual Entry"
      },
      {
        name: "Kollam Backwaters",
        type: "backwaters",
        coordinates: { latitude: 8.8932, longitude: 76.6141 },
        description: "Gateway to Kerala backwaters",
        location: "Kollam",
        district: "Kollam",
        source: "Manual Entry"
      },
      {
        name: "Kochi Backwaters",
        type: "backwaters",
        coordinates: { latitude: 9.9312, longitude: 76.2673 },
        description: "Urban backwaters in Kochi",
        location: "Kochi, Ernakulam",
        district: "Ernakulam",
        source: "Manual Entry"
      },

      // Hill Stations & Hill Views
      {
        name: "Munnar",
        type: "hillview",
        coordinates: { latitude: 10.0889, longitude: 77.0595 },
        description: "Famous hill station with tea gardens",
        location: "Munnar, Idukki",
        district: "Idukki",
        source: "Manual Entry"
      },
      {
        name: "Wayanad Hills",
        type: "hillview",
        coordinates: { latitude: 11.6854, longitude: 76.1320 },
        description: "Hill station in Western Ghats",
        location: "Wayanad",
        district: "Wayanad",
        source: "Manual Entry"
      },
      {
        name: "Thekkady Hills",
        type: "hillview",
        coordinates: { latitude: 9.5401, longitude: 77.1593 },
        description: "Hill station around Periyar Wildlife Sanctuary",
        location: "Thekkady, Idukki",
        district: "Idukki",
        source: "Manual Entry"
      },
      {
        name: "Nelliampathy Hills",
        type: "hillview",
        coordinates: { latitude: 10.5418, longitude: 76.6873 },
        description: "Hill station with tea and orange plantations",
        location: "Nelliampathy, Palakkad",
        district: "Palakkad",
        source: "Manual Entry"
      },
      {
        name: "Vagamon Hills",
        type: "hillview",
        coordinates: { latitude: 9.7167, longitude: 76.9167 },
        description: "Hill station known for meadows and valleys",
        location: "Vagamon, Idukki",
        district: "Idukki",
        source: "Manual Entry"
      },
      {
        name: "Ponmudi Hills",
        type: "hillview",
        coordinates: { latitude: 8.7667, longitude: 77.1167 },
        description: "Hill station with golden peak",
        location: "Ponmudi, Thiruvananthapuram",
        district: "Thiruvananthapuram",
        source: "Manual Entry"
      },
      {
        name: "Devikulam Hills",
        type: "hillview",
        coordinates: { latitude: 10.0333, longitude: 77.0167 },
        description: "Hill station near Munnar",
        location: "Devikulam, Idukki",
        district: "Idukki",
        source: "Manual Entry"
      },

      // Tea Gardens
      {
        name: "Munnar Tea Gardens",
        type: "tea gardens",
        coordinates: { latitude: 10.0889, longitude: 77.0595 },
        description: "Extensive tea plantations in Western Ghats",
        location: "Munnar, Idukki",
        district: "Idukki",
        source: "Manual Entry"
      },
      {
        name: "Peermade Tea Gardens",
        type: "tea gardens",
        coordinates: { latitude: 9.5667, longitude: 76.9333 },
        description: "Tea plantations in Idukki",
        location: "Peermade, Idukki",
        district: "Idukki",
        source: "Manual Entry"
      },
      {
        name: "Vandanmedu Tea Gardens",
        type: "tea gardens",
        coordinates: { latitude: 9.6667, longitude: 77.1000 },
        description: "Cardamom and tea plantations",
        location: "Vandanmedu, Idukki",
        district: "Idukki",
        source: "Manual Entry"
      },

      // Lakes
      {
        name: "Vembanad Lake",
        type: "lake",
        coordinates: { latitude: 9.5983, longitude: 76.3850 },
        description: "Largest lake in Kerala",
        location: "Alappuzha-Kottayam",
        district: "Alappuzha",
        source: "Manual Entry"
      },
      {
        name: "Periyar Lake",
        type: "lake",
        coordinates: { latitude: 9.5401, longitude: 77.1593 },
        description: "Artificial lake in Thekkady",
        location: "Thekkady, Idukki",
        district: "Idukki",
        source: "Manual Entry"
      },
      {
        name: "Mattupetty Lake",
        type: "lake",
        coordinates: { latitude: 10.1167, longitude: 77.1167 },
        description: "Dam and lake near Munnar",
        location: "Mattupetty, Idukki",
        district: "Idukki",
        source: "Manual Entry"
      },
      {
        name: "Kundala Lake",
        type: "lake",
        coordinates: { latitude: 10.0833, longitude: 77.0667 },
        description: "Artificial lake near Munnar",
        location: "Kundala, Idukki",
        district: "Idukki",
        source: "Manual Entry"
      },
      {
        name: "Pookode Lake",
        type: "lake",
        coordinates: { latitude: 11.5333, longitude: 76.0833 },
        description: "Natural freshwater lake in Wayanad",
        location: "Wayanad",
        district: "Wayanad",
        source: "Manual Entry"
      },

      // Rivers & Streams
      {
        name: "Chalakudy River",
        type: "stream",
        coordinates: { latitude: 10.3000, longitude: 76.5000 },
        description: "River flowing through Thrissur",
        location: "Thrissur",
        district: "Thrissur",
        source: "Manual Entry"
      },
      {
        name: "Periyar River",
        type: "stream",
        coordinates: { latitude: 9.9312, longitude: 76.2673 },
        description: "Longest river in Kerala",
        location: "Multiple districts",
        district: "Multiple",
        source: "Manual Entry"
      },
      {
        name: "Bharathapuzha River",
        type: "stream",
        coordinates: { latitude: 10.7500, longitude: 76.2167 },
        description: "Second longest river in Kerala",
        location: "Palakkad",
        district: "Palakkad",
        source: "Manual Entry"
      },

      // Landscapes & Gardens
      {
        name: "Shalimar Spice Garden",
        type: "landscape",
        coordinates: { latitude: 9.5833, longitude: 77.2667 },
        description: "Spice plantation in Thekkady",
        location: "Thekkady, Idukki",
        district: "Idukki",
        source: "Manual Entry"
      },
      {
        name: "Napier Museum Gardens",
        type: "landscape",
        coordinates: { latitude: 8.5167, longitude: 76.9500 },
        description: "Museum with beautiful gardens",
        location: "Thiruvananthapuram",
        district: "Thiruvananthapuram",
        source: "Manual Entry"
      },
      {
        name: "Malampuzha Gardens",
        type: "landscape",
        coordinates: { latitude: 10.8167, longitude: 76.6833 },
        description: "Garden and dam site",
        location: "Palakkad",
        district: "Palakkad",
        source: "Manual Entry"
      },
      {
        name: "Chethalayam Falls",
        type: "waterfall",
        coordinates: { latitude: 11.2500, longitude: 76.0833 },
        description: "Waterfall in Wayanad",
        location: "Wayanad",
        district: "Wayanad",
        source: "Manual Entry"
      },
      {
        name: "Kanthanpara Waterfalls",
        type: "waterfall",
        coordinates: { latitude: 11.6167, longitude: 76.1167 },
        description: "Waterfall in Wayanad",
        location: "Wayanad",
        district: "Wayanad",
        source: "Manual Entry"
      },
      {
        name: "Banasura Sagar Dam",
        type: "lake",
        coordinates: { latitude: 11.7167, longitude: 76.0833 },
        description: "Largest earth dam in India",
        location: "Wayanad",
        district: "Wayanad",
        source: "Manual Entry"
      },
      {
        name: "Chembra Peak",
        type: "hillview",
        coordinates: { latitude: 11.5000, longitude: 76.0833 },
        description: "Highest peak in Wayanad",
        location: "Wayanad",
        district: "Wayanad",
        source: "Manual Entry"
      },
      {
        name: "Anamudi Peak",
        type: "hillview",
        coordinates: { latitude: 10.1667, longitude: 77.0667 },
        description: "Highest peak in South India",
        location: "Munnar, Idukki",
        district: "Idukki",
        source: "Manual Entry"
      },
      {
        name: "Meesapulimala Peak",
        type: "hillview",
        coordinates: { latitude: 10.1500, longitude: 77.0167 },
        description: "Second highest peak in Western Ghats",
        location: "Munnar, Idukki",
        district: "Idukki",
        source: "Manual Entry"
      },
      {
        name: "Agasthyakoodam Peak",
        type: "hillview",
        coordinates: { latitude: 8.6167, longitude: 77.1833 },
        description: "Peak in Agasthyamala Biosphere Reserve",
        location: "Thiruvananthapuram",
        district: "Thiruvananthapuram",
        source: "Manual Entry"
      }
    ];
  }

  // Get coordinates using free Nominatim API
  async geocodeLocation(placeName: string, location?: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const query = location ? `${placeName}, ${location}, Kerala, India` : `${placeName}, Kerala, India`;
      
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          limit: 1,
          countrycodes: 'in'
        },
        headers: {
          'User-Agent': 'Kerala Tourism Data Collector'
        },
        timeout: 5000
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        };
      }
    } catch (error) {
      console.error(`Error geocoding ${placeName}:`, error);
    }
    
    return null;
  }

  // Get additional viewpoints from known sources
  async getAdditionalViewpoints(): Promise<ViewPoint[]> {
    const additionalPlaces = [
      { name: "Edakkal Caves", type: "landscape", location: "Wayanad" },
      { name: "Jatayu Earth's Center", type: "landscape", location: "Kollam" },
      { name: "Thenmala Ecotourism", type: "landscape", location: "Kollam" },
      { name: "Silent Valley", type: "landscape", location: "Palakkad" },
      { name: "Parambikulam Tiger Reserve", type: "landscape", location: "Palakkad" },
      { name: "Chinnar Wildlife Sanctuary", type: "landscape", location: "Idukki" },
      { name: "Eravikulam National Park", type: "landscape", location: "Idukki" },
      { name: "Kurinji Andavam", type: "landscape", location: "Idukki" },
      { name: "Top Station", type: "hillview", location: "Idukki" },
      { name: "Echo Point", type: "hillview", location: "Idukki" },
      { name: "Rajamalai", type: "hillview", location: "Idukki" },
      { name: "Kolukkumalai Tea Estate", type: "tea gardens", location: "Idukki" },
      { name: "Lockhart Gap", type: "hillview", location: "Idukki" },
      { name: "Anayirankal Dam", type: "lake", location: "Idukki" },
      { name: "Idukki Dam", type: "lake", location: "Idukki" },
      { name: "Mullaperiyar Dam", type: "lake", location: "Idukki" },
      { name: "Malankara Dam", type: "lake", location: "Idukki" },
      { name: "Kappad Beach", type: "beach", location: "Kozhikode" },
      { name: "Kozhikode Beach", type: "beach", location: "Kozhikode" },
      { name: "Payyambalam Beach", type: "beach", location: "Kannur" },
      { name: "Thottada Beach", type: "beach", location: "Kannur" },
      { name: "Kizhunna Beach", type: "beach", location: "Kannur" },
      { name: "Dharmadam Beach", type: "beach", location: "Kannur" },
      { name: "Ashtamudi Lake", type: "lake", location: "Kollam" },
      { name: "Sasthamkotta Lake", type: "lake", location: "Kollam" },
      { name: "Vellayani Lake", type: "lake", location: "Thiruvananthapuram" },
      { name: "Akkulam Lake", type: "lake", location: "Thiruvananthapuram" }
    ];

    const viewpoints: ViewPoint[] = [];

    for (const place of additionalPlaces) {
      console.log(`Geocoding: ${place.name}`);
      const coords = await this.geocodeLocation(place.name, place.location);
      
      if (coords) {
        viewpoints.push({
          name: place.name,
          type: place.type,
          coordinates: coords,
          location: place.location,
          source: "Geocoded"
        });
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return viewpoints;
  }

  // Main collection function
  async collectAllViewpoints(): Promise<ViewPoint[]> {
    console.log('🌴 Starting Kerala Tourism Data Collection...\n');
    
    // Start with comprehensive manual dataset
    this.viewPoints = [...this.getComprehensiveKeralaViewpoints()];
    console.log(`📍 Added ${this.viewPoints.length} manually curated viewpoints`);
    
    try {
      // Add geocoded viewpoints
      const additionalViewpoints = await this.getAdditionalViewpoints();
      this.viewPoints.push(...additionalViewpoints);
      console.log(`📍 Added ${additionalViewpoints.length} additional geocoded viewpoints`);
      
    } catch (error) {
      console.error('Error collecting additional viewpoints:', error);
    }
    
    console.log(`\n✅ Collection completed. Total: ${this.viewPoints.length} viewpoints.`);
    return this.viewPoints;
  }

  // Export data to JSON
  exportToJSON(): string {
    return JSON.stringify(this.viewPoints, null, 2);
  }

  // Get viewpoints by type
  getViewpointsByType(type: string): ViewPoint[] {
    return this.viewPoints.filter(point => point.type === type);
  }

  // Get all viewpoint types
  getAllTypes(): string[] {
    const types = new Set(this.viewPoints.map(point => point.type));
    return Array.from(types);
  }

  // Get viewpoints by district
  getViewpointsByDistrict(district: string): ViewPoint[] {
    return this.viewPoints.filter(point => 
      point.district?.toLowerCase().includes(district.toLowerCase())
    );
  }

  // Get all districts
  getAllDistricts(): string[] {
    const districts = new Set(
      this.viewPoints
        .map(point => point.district)
        .filter(district => district) as string[]
    );
    return Array.from(districts);
  }
}
