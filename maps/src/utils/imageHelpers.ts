// Helper functions for matching viewpoint names with image files

export const getImageForViewpoint = (viewpointName: string): string | null => {
  // Normalize the viewpoint name to match image file names
  const normalizedName = normalizeImageName(viewpointName);
  
  // List of available images (based on what we found in public/img/)
  const availableImages = [
    'akkulam tourist village',
    'alappuzha',
    'alumkadavu',
    'ashtamudi lake',
    'athirappilly vazhachal waterfalls',
    'bekal beach',
    'cherai beach',
    'chethalayam falls',
    'kanthampara waterfalls',
    'kappad beach',
    'kovalam',
    'kozhikode beach',
    'kumarakom',
    'marari beach',
    'marine drive',
    'meenmutty waterfalls',
    'muzhappilangad beach',
    'palaruvi waterfalls',
    'payyambalam beach',
    'pookode lake',
    'sasthamkotta',
    'shankhumugham beach',
    'soochipara waterfalls',
    'thommankuthu waterfalls',
    'tottada beach',
    'varkala beach',
    'vellayani',
    'vembanad lake'
  ];

  // Try exact match first
  if (availableImages.includes(normalizedName)) {
    return `/img/${normalizedName}.png`;
  }

  // Try partial matches for complex names
  for (const imageName of availableImages) {
    if (normalizedName.includes(imageName) || imageName.includes(normalizedName)) {
      return `/img/${imageName}.png`;
    }
  }

  // Special case mappings for known mismatches
  const specialMappings: { [key: string]: string } = {
    'athirappilly falls': 'athirappilly vazhachal waterfalls',
    'vazhachal falls': 'athirappilly vazhachal waterfalls',
    'kovalam beach': 'kovalam',
    'varkala beach': 'varkala beach',
    'cherai beach': 'cherai beach',
    'marari beach': 'marari beach',
    'bekal beach': 'bekal beach',
    'kappad beach': 'kappad beach',
    'kozhikode beach': 'kozhikode beach',
    'muzhappilangad beach': 'muzhappilangad beach',
    'payyambalam beach': 'payyambalam beach',
    'shankhumugham beach': 'shankhumugham beach',
    'tottada beach': 'tottada beach',
    'meenmutty waterfalls': 'meenmutty waterfalls',
    'soochipara waterfalls': 'soochipara waterfalls',
    'palaruvi waterfalls': 'palaruvi waterfalls',
    'thommankuthu waterfalls': 'thommankuthu waterfalls',
    'kanthampara waterfalls': 'kanthampara waterfalls',
    'chethalayam falls': 'chethalayam falls',
    'pookode lake': 'pookode lake',
    'ashtamudi lake': 'ashtamudi lake',
    'vembanad lake': 'vembanad lake',
    'vellayani lake': 'vellayani',
    'sasthamkotta lake': 'sasthamkotta',
    'kumarakom': 'kumarakom',
    'alappuzha': 'alappuzha',
    'alleppey': 'alappuzha',
    'marine drive kochi': 'marine drive',
    'marine drive ernakulam': 'marine drive',
    'akkulam tourist village': 'akkulam tourist village',
    'alumkadavu': 'alumkadavu'
  };

  const mappedName = specialMappings[normalizedName];
  if (mappedName && availableImages.includes(mappedName)) {
    return `/img/${mappedName}.png`;
  }

  // If no image found, return null
  return null;
};

const normalizeImageName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

// Function to check if image exists (for error handling)
export const imageExists = (imagePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
};

// Get placeholder image for viewpoints without specific images
export const getPlaceholderImage = (viewpointType: string): string => {
  const placeholders: { [key: string]: string } = {
    'waterfall': '/img/placeholder-waterfall.jpg',
    'beach': '/img/placeholder-beach.jpg',
    'lake': '/img/placeholder-lake.jpg',
    'hillview': '/img/placeholder-hill.jpg',
    'backwaters': '/img/placeholder-backwaters.jpg',
    'tea gardens': '/img/placeholder-tea.jpg',
    'default': '/img/placeholder-default.jpg'
  };

  return placeholders[viewpointType] || placeholders['default'];
};
