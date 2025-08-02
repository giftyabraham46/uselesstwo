#!/bin/bash

# Tree Calculator Demo Script
# This script creates sample tree images for testing the application

echo "🌳 Creating sample tree images for Tree Calculator demo..."

# Create sample images directory
mkdir -p sample_images

# Create a simple Python script to generate demo images
cat > create_demo_images.py << 'EOF'
import numpy as np
import cv2
import os

def create_tree_image(width, height, tree_width, tree_height, view_type="front"):
    """Create a synthetic tree image for demo purposes"""
    
    # Create base image (sky blue background)
    image = np.full((height, width, 3), (135, 206, 235), dtype=np.uint8)
    
    # Add ground (green)
    ground_height = int(height * 0.1)
    image[height-ground_height:, :] = (34, 139, 34)
    
    # Calculate tree position (centered horizontally, bottom on ground)
    tree_x = (width - tree_width) // 2
    tree_y = height - ground_height - tree_height
    
    if view_type == "front":
        # Create tree trunk (brown rectangle)
        trunk_width = max(10, tree_width // 8)
        trunk_height = tree_height // 3
        trunk_x = tree_x + (tree_width - trunk_width) // 2
        trunk_y = tree_y + tree_height - trunk_height
        
        cv2.rectangle(image, 
                     (trunk_x, trunk_y), 
                     (trunk_x + trunk_width, trunk_y + trunk_height), 
                     (101, 67, 33), -1)
        
        # Create tree crown (green ellipse)
        crown_center = (tree_x + tree_width // 2, tree_y + tree_height // 3)
        crown_axes = (tree_width // 2, int(tree_height * 0.7) // 2)
        
        cv2.ellipse(image, crown_center, crown_axes, 0, 0, 360, (34, 139, 34), -1)
        
        # Add some leaf texture
        for _ in range(200):
            x = np.random.randint(crown_center[0] - crown_axes[0], crown_center[0] + crown_axes[0])
            y = np.random.randint(crown_center[1] - crown_axes[1], crown_center[1] + crown_axes[1])
            
            # Check if point is inside ellipse
            if ((x - crown_center[0])**2 / crown_axes[0]**2 + 
                (y - crown_center[1])**2 / crown_axes[1]**2) <= 1:
                
                color = np.random.choice([
                    (0, 100, 0),    # Dark green
                    (0, 128, 0),    # Green
                    (50, 205, 50),  # Lime green
                ])
                cv2.circle(image, (x, y), np.random.randint(2, 5), color, -1)
    
    elif view_type == "side":
        # Side view - show depth
        depth_width = tree_width // 2  # Side view shows less width (depth)
        
        # Create tree trunk
        trunk_width = max(8, depth_width // 6)
        trunk_height = tree_height // 3
        trunk_x = tree_x + (tree_width - trunk_width) // 2
        trunk_y = tree_y + tree_height - trunk_height
        
        cv2.rectangle(image, 
                     (trunk_x, trunk_y), 
                     (trunk_x + trunk_width, trunk_y + trunk_height), 
                     (101, 67, 33), -1)
        
        # Create tree crown (narrower ellipse for side view)
        crown_center = (tree_x + tree_width // 2, tree_y + tree_height // 3)
        crown_axes = (depth_width // 2, int(tree_height * 0.7) // 2)
        
        cv2.ellipse(image, crown_center, crown_axes, 0, 0, 360, (34, 139, 34), -1)
        
        # Add leaf texture
        for _ in range(150):
            x = np.random.randint(crown_center[0] - crown_axes[0], crown_center[0] + crown_axes[0])
            y = np.random.randint(crown_center[1] - crown_axes[1], crown_center[1] + crown_axes[1])
            
            if ((x - crown_center[0])**2 / crown_axes[0]**2 + 
                (y - crown_center[1])**2 / crown_axes[1]**2) <= 1:
                
                color = np.random.choice([
                    (0, 100, 0),
                    (0, 128, 0),
                    (50, 205, 50),
                ])
                cv2.circle(image, (x, y), np.random.randint(2, 4), color, -1)
    
    return image

def main():
    # Create sample images directory
    os.makedirs('sample_images', exist_ok=True)
    
    # Generate different tree samples
    trees = [
        {"name": "oak", "width": 200, "height": 300, "img_size": (800, 600)},
        {"name": "pine", "width": 120, "height": 400, "img_size": (800, 600)},
        {"name": "maple", "width": 180, "height": 250, "img_size": (800, 600)},
    ]
    
    for tree in trees:
        print(f"Creating {tree['name']} tree images...")
        
        # Front view
        front_img = create_tree_image(
            tree['img_size'][0], tree['img_size'][1],
            tree['width'], tree['height'], "front"
        )
        cv2.imwrite(f"sample_images/{tree['name']}_front.jpg", front_img)
        
        # Side view
        side_img = create_tree_image(
            tree['img_size'][0], tree['img_size'][1],
            tree['width'], tree['height'], "side"
        )
        cv2.imwrite(f"sample_images/{tree['name']}_side.jpg", side_img)
    
    print("✅ Sample images created successfully!")
    print("📁 Images saved in: sample_images/")
    print("🔍 Files created:")
    for tree in trees:
        print(f"   - {tree['name']}_front.jpg")
        print(f"   - {tree['name']}_side.jpg")

if __name__ == "__main__":
    main()
EOF

# Run the Python script to create demo images
python3 create_demo_images.py

# Clean up
rm create_demo_images.py

echo ""
echo "🎉 Demo images created successfully!"
echo "📖 Usage:"
echo "   1. Start the Tree Calculator application"
echo "   2. Upload any front and side image pair:"
echo "      - oak_front.jpg + oak_side.jpg"
echo "      - pine_front.jpg + pine_side.jpg" 
echo "      - maple_front.jpg + maple_side.jpg"
echo "   3. Optional: Add metadata (camera height: 1.7m, distance: 5m)"
echo "   4. Click 'Analyze Tree' to see the results!"
echo ""
echo "📝 Note: These are synthetic images for demonstration."
echo "   Real tree photos will produce more accurate results."
