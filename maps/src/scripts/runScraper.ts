import { KeralaTourismDataCollector, ViewPoint } from '../scrapers/keralaDataCollector';
import fs from 'fs';
import path from 'path';

async function runDataCollection() {
  console.log('🌴 Starting Kerala Viewpoints Data Collection...\n');
  
  const collector = new KeralaTourismDataCollector();
  
  try {
    // Run the data collection
    const viewpoints = await collector.collectAllViewpoints();
    
    // Display results
    console.log('\n📊 Collection Results:');
    console.log(`Total viewpoints found: ${viewpoints.length}`);
    
    // Group by type
    const types = collector.getAllTypes();
    console.log('\n📍 Viewpoints by category:');
    types.forEach((type: string) => {
      const count = collector.getViewpointsByType(type).length;
      console.log(`  ${type}: ${count} locations`);
    });
    
    // Group by district
    const districts = collector.getAllDistricts();
    console.log('\n🏛️ Viewpoints by district:');
    districts.forEach((district: string) => {
      const count = collector.getViewpointsByDistrict(district).length;
      console.log(`  ${district}: ${count} locations`);
    });
    
    // Save to data directory
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Save as JSON
    const jsonPath = path.join(dataDir, 'kerala-viewpoints.json');
    fs.writeFileSync(jsonPath, collector.exportToJSON());
    console.log(`\n💾 Data saved to: ${jsonPath}`);
    
    // Save as TypeScript module
    const tsContent = `// Auto-generated Kerala viewpoints data
export const keralaViewpoints = ${collector.exportToJSON()};

export type ViewPointType = ${types.map((t: string) => `'${t}'`).join(' | ')};

export interface ViewPoint {
  name: string;
  type: ViewPointType;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  location?: string;
  district?: string;
  source?: string;
}

// Helper functions
export function getViewpointsByType(type: ViewPointType): ViewPoint[] {
  return keralaViewpoints.filter(point => point.type === type);
}

export function getViewpointsByDistrict(district: string): ViewPoint[] {
  return keralaViewpoints.filter(point => 
    point.district?.toLowerCase().includes(district.toLowerCase())
  );
}

export function getAllTypes(): ViewPointType[] {
  const types = new Set(keralaViewpoints.map(point => point.type));
  return Array.from(types) as ViewPointType[];
}

export function getAllDistricts(): string[] {
  const districts = new Set(
    keralaViewpoints
      .map(point => point.district)
      .filter(district => district) as string[]
  );
  return Array.from(districts);
}
`;
    
    const tsPath = path.join(dataDir, 'kerala-viewpoints.ts');
    fs.writeFileSync(tsPath, tsContent);
    console.log(`📝 TypeScript module saved to: ${tsPath}`);
    
    // Display sample data by category
    console.log('\n🔍 Sample viewpoints by category:');
    types.slice(0, 5).forEach((type: string) => {
      const pointsOfType = collector.getViewpointsByType(type);
      console.log(`\n${type.toUpperCase()}:`);
      pointsOfType.slice(0, 3).forEach((point: ViewPoint, index: number) => {
        console.log(`  ${index + 1}. ${point.name}`);
        console.log(`     📍 ${point.coordinates.latitude}, ${point.coordinates.longitude}`);
        console.log(`     📍 ${point.location || 'Location not specified'}`);
        if (point.description) {
          console.log(`     📄 ${point.description}`);
        }
      });
    });
    
    console.log('\n✅ Data collection completed successfully!');
    console.log('\n🗺️  You can now use this data in your map application by importing from:');
    console.log(`   import { keralaViewpoints } from './data/kerala-viewpoints';`);
    
  } catch (error) {
    console.error('❌ Error running data collection:', error);
  }
}

// Run the data collection
runDataCollection();
