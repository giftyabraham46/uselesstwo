import os
import json
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from typing import Dict, Any
import tempfile
from datetime import datetime
from app.core.config import settings

class ReportGenerator:
    """Generates reports and exports in various formats"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()
    
    def _create_custom_styles(self):
        """Create custom paragraph styles"""
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.darkgreen
        )
        
        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            textColor=colors.darkblue
        )
    
    def generate_pdf_report(self, session_id: str, result: Dict[str, Any]) -> str:
        """Generate comprehensive PDF report"""
        
        results_dir = os.path.join(settings.RESULTS_DIR, session_id)
        pdf_path = os.path.join(results_dir, f"tree_analysis_report_{session_id}.pdf")
        
        # Create PDF document
        doc = SimpleDocTemplate(pdf_path, pagesize=A4)
        story = []
        
        # Title
        story.append(Paragraph("Tree Analysis Report", self.title_style))
        story.append(Spacer(1, 12))
        
        # Session info
        story.append(Paragraph("Analysis Information", self.heading_style))
        info_data = [
            ["Session ID", session_id],
            ["Analysis Date", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
            ["Processing Time", f"{result.get('processing_time', 'N/A')} seconds"]
        ]
        info_table = Table(info_data, colWidths=[2*inch, 3*inch])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(info_table)
        story.append(Spacer(1, 20))
        
        # Tree Dimensions
        story.append(Paragraph("Tree Dimensions", self.heading_style))
        dimensions = result['dimensions']
        dim_data = [
            ["Measurement", "Value", "Unit"],
            ["Height", f"{dimensions['height']:.2f}", dimensions['unit']],
            ["Width", f"{dimensions['width']:.2f}", dimensions['unit']],
            ["Depth", f"{dimensions['depth']:.2f}", dimensions['unit']],
            ["Confidence", f"{dimensions['confidence']:.1%}", ""]
        ]
        dim_table = Table(dim_data, colWidths=[1.5*inch, 1.5*inch, 1*inch])
        dim_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(dim_table)
        story.append(Spacer(1, 20))
        
        # Leaf Analysis
        story.append(Paragraph("Leaf Analysis", self.heading_style))
        leaf_analysis = result['leaf_analysis']
        leaf_data = [
            ["Property", "Value"],
            ["Average Leaf Size", f"{leaf_analysis['average_leaf_size']:.2f} pixels²"],
            ["Estimated Leaf Count", f"{leaf_analysis['estimated_leaf_count']:,}"],
            ["Leaf Type", leaf_analysis.get('leaf_type', 'Unknown')],
            ["Classification Confidence", f"{leaf_analysis.get('leaf_confidence', 0):.1%}"],
            ["Edge Density", f"{leaf_analysis['edge_density']:.4f}"],
            ["Dominant Colors", ", ".join(leaf_analysis['dominant_colors'])]
        ]
        leaf_table = Table(leaf_data, colWidths=[2*inch, 3*inch])
        leaf_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgreen),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(leaf_table)
        story.append(Spacer(1, 20))
        
        # Foliage Data
        story.append(Paragraph("3D Foliage Data", self.heading_style))
        foliage_data = result['foliage_data']
        foliage_table_data = [
            ["Property", "Value"],
            ["Estimated Volume", f"{foliage_data['volume']:.2f} cubic units"],
            ["Foliage Density", f"{foliage_data['density']:.4f} leaves/unit³"],
            ["3D Model Vertices", f"{foliage_data['vertex_count']:,}"],
            ["3D Model Faces", f"{foliage_data['face_count']:,}"]
        ]
        foliage_table = Table(foliage_table_data, colWidths=[2*inch, 3*inch])
        foliage_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.purple),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lavender),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(foliage_table)
        
        # Build PDF
        doc.build(story)
        
        return pdf_path
    
    def generate_visualization(self, session_id: str, result: Dict[str, Any]) -> str:
        """Generate visualization image"""
        
        results_dir = os.path.join(settings.RESULTS_DIR, session_id)
        viz_path = os.path.join(results_dir, f"tree_visualization_{session_id}.png")
        
        # Create figure with subplots
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 10))
        fig.suptitle('Tree Analysis Results', fontsize=16, fontweight='bold')
        
        # Dimensions visualization
        dimensions = result['dimensions']
        ax1.bar(['Height', 'Width', 'Depth'], 
               [dimensions['height'], dimensions['width'], dimensions['depth']],
               color=['green', 'blue', 'orange'])
        ax1.set_title('Tree Dimensions')
        ax1.set_ylabel(f"Size ({dimensions['unit']})")
        ax1.grid(True, alpha=0.3)
        
        # Leaf analysis pie chart
        leaf_analysis = result['leaf_analysis']
        if leaf_analysis['dominant_colors']:
            colors_list = leaf_analysis['dominant_colors']
            sizes = [1] * len(colors_list)  # Equal sizes for demo
            ax2.pie(sizes, labels=[f"Color {i+1}" for i in range(len(colors_list))], 
                   colors=[c for c in colors_list], autopct='%1.1f%%')
            ax2.set_title('Dominant Colors')
        else:
            ax2.text(0.5, 0.5, 'No colors detected', ha='center', va='center', transform=ax2.transAxes)
            ax2.set_title('Dominant Colors')
        
        # Foliage data
        foliage_data = result['foliage_data']
        ax3.text(0.1, 0.8, f"Volume: {foliage_data['volume']:.2f}", transform=ax3.transAxes, fontsize=12)
        ax3.text(0.1, 0.6, f"Density: {foliage_data['density']:.4f}", transform=ax3.transAxes, fontsize=12)
        ax3.text(0.1, 0.4, f"Vertices: {foliage_data['vertex_count']:,}", transform=ax3.transAxes, fontsize=12)
        ax3.text(0.1, 0.2, f"Faces: {foliage_data['face_count']:,}", transform=ax3.transAxes, fontsize=12)
        ax3.set_title('3D Model Data')
        ax3.axis('off')
        
        # Summary statistics
        ax4.text(0.1, 0.8, f"Leaf Count: {leaf_analysis['estimated_leaf_count']:,}", 
                transform=ax4.transAxes, fontsize=12)
        ax4.text(0.1, 0.6, f"Avg Leaf Size: {leaf_analysis['average_leaf_size']:.2f}", 
                transform=ax4.transAxes, fontsize=12)
        ax4.text(0.1, 0.4, f"Edge Density: {leaf_analysis['edge_density']:.4f}", 
                transform=ax4.transAxes, fontsize=12)
        ax4.text(0.1, 0.2, f"Confidence: {dimensions['confidence']:.1%}", 
                transform=ax4.transAxes, fontsize=12)
        ax4.set_title('Analysis Summary')
        ax4.axis('off')
        
        plt.tight_layout()
        plt.savefig(viz_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return viz_path
    
    def generate_3d_model(self, session_id: str, result: Dict[str, Any], format_type: str) -> str:
        """Generate 3D model file (OBJ or GLTF)"""
        
        results_dir = os.path.join(settings.RESULTS_DIR, session_id)
        
        if format_type.lower() == "obj":
            model_path = os.path.join(results_dir, f"tree_model_{session_id}.obj")
            self._generate_obj_model(model_path, result)
        elif format_type.lower() == "gltf":
            model_path = os.path.join(results_dir, f"tree_model_{session_id}.gltf")
            self._generate_gltf_model(model_path, result)
        else:
            raise ValueError(f"Unsupported 3D format: {format_type}")
        
        return model_path
    
    def _generate_obj_model(self, output_path: str, result: Dict[str, Any]) -> None:
        """Generate simple OBJ model of the tree"""
        
        dimensions = result['dimensions']
        foliage_data = result['foliage_data']
        leaf_analysis = result['leaf_analysis']
        
        # Create a simple tree structure
        # Trunk (cylinder) + Crown (ellipsoid)
        
        with open(output_path, 'w') as f:
            f.write("# Tree Model Generated by Tree Calculator\n")
            f.write(f"# Session ID: {result['session_id']}\n")
            f.write("# \n")
            
            # Trunk vertices (simple cylinder)
            trunk_height = dimensions['height'] * 0.3  # 30% of total height
            trunk_radius = dimensions['width'] * 0.05   # 5% of width
            
            # Generate trunk vertices
            trunk_segments = 8
            for i in range(trunk_segments):
                angle = 2 * np.pi * i / trunk_segments
                x = trunk_radius * np.cos(angle)
                z = trunk_radius * np.sin(angle)
                
                # Bottom circle
                f.write(f"v {x:.4f} 0.0000 {z:.4f}\n")
                # Top circle
                f.write(f"v {x:.4f} {trunk_height:.4f} {z:.4f}\n")
            
            # Crown vertices (simplified ellipsoid)
            crown_segments = 16
            crown_rings = 8
            
            for ring in range(crown_rings + 1):
                phi = np.pi * ring / crown_rings  # 0 to pi
                y = trunk_height + (dimensions['height'] - trunk_height) * (1 - np.cos(phi))
                ring_radius = np.sin(phi) * dimensions['width'] / 2
                
                if ring == 0 or ring == crown_rings:
                    # Top and bottom points
                    f.write(f"v 0.0000 {y:.4f} 0.0000\n")
                else:
                    for seg in range(crown_segments):
                        theta = 2 * np.pi * seg / crown_segments
                        x = ring_radius * np.cos(theta)
                        z = ring_radius * np.sin(theta) * dimensions['depth'] / dimensions['width']
                        f.write(f"v {x:.4f} {y:.4f} {z:.4f}\n")
            
            # Generate faces (simplified)
            f.write("\n# Faces\n")
            
            # Trunk faces
            for i in range(trunk_segments):
                i1 = i * 2 + 1
                i2 = i * 2 + 2
                i3 = ((i + 1) % trunk_segments) * 2 + 1
                i4 = ((i + 1) % trunk_segments) * 2 + 2
                
                f.write(f"f {i1} {i3} {i4}\n")
                f.write(f"f {i1} {i4} {i2}\n")
            
            # Note: Crown faces would be more complex - simplified for demo
            f.write("# Crown faces simplified for demonstration\n")
    
    def _generate_gltf_model(self, output_path: str, result: Dict[str, Any]) -> None:
        """Generate simple GLTF model of the tree"""
        
        # Basic GLTF structure (simplified)
        gltf_data = {
            "asset": {
                "version": "2.0",
                "generator": "Tree Calculator"
            },
            "scene": 0,
            "scenes": [
                {
                    "nodes": [0]
                }
            ],
            "nodes": [
                {
                    "name": "Tree",
                    "mesh": 0
                }
            ],
            "meshes": [
                {
                    "name": "TreeMesh",
                    "primitives": [
                        {
                            "attributes": {
                                "POSITION": 0
                            },
                            "indices": 1,
                            "material": 0
                        }
                    ]
                }
            ],
            "materials": [
                {
                    "name": "TreeMaterial",
                    "pbrMetallicRoughness": {
                        "baseColorFactor": [0.2, 0.8, 0.2, 1.0],
                        "metallicFactor": 0.0,
                        "roughnessFactor": 0.8
                    }
                }
            ],
            "accessors": [
                {
                    "bufferView": 0,
                    "componentType": 5126,
                    "count": 0,  # Will be updated
                    "type": "VEC3"
                },
                {
                    "bufferView": 1,
                    "componentType": 5123,
                    "count": 0,  # Will be updated
                    "type": "SCALAR"
                }
            ],
            "bufferViews": [
                {
                    "buffer": 0,
                    "byteLength": 0,  # Will be updated
                    "target": 34962
                },
                {
                    "buffer": 0,
                    "byteOffset": 0,  # Will be updated
                    "byteLength": 0,  # Will be updated
                    "target": 34963
                }
            ],
            "buffers": [
                {
                    "byteLength": 0  # Will be updated
                }
            ]
        }
        
        with open(output_path, 'w') as f:
            json.dump(gltf_data, f, indent=2)
    
    def generate_summary_json(self, session_id: str, result: Dict[str, Any]) -> str:
        """Generate JSON summary for API consumption"""
        
        results_dir = os.path.join(settings.RESULTS_DIR, session_id)
        json_path = os.path.join(results_dir, f"summary_{session_id}.json")
        
        summary = {
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "dimensions": result['dimensions'],
            "leaf_analysis": result['leaf_analysis'],
            "foliage_data": result['foliage_data'],
            "summary_stats": {
                "total_volume": result['foliage_data']['volume'],
                "leaf_density": result['foliage_data']['density'],
                "estimated_leaf_count": result['leaf_analysis']['estimated_leaf_count']
            }
        }
        
        with open(json_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        return json_path
