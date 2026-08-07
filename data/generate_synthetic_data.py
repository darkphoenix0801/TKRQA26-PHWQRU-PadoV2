import pandas as pd
import numpy as np
import os

def generate_synthetic_data(num_samples=1000):
    """
    Generates synthetic placement data.
    The 'placed' target variable is calculated based on logical correlations 
    so the ML model has real patterns to learn.
    """
    np.random.seed(42) # For reproducibility
    
    # 1. Generate base features with realistic distributions
    # CGPA: Mostly between 6.0 and 9.5
    cgpa = np.random.normal(loc=7.5, scale=1.0, size=num_samples)
    cgpa = np.clip(cgpa, 4.0, 10.0) 
    
    # Scores out of 100
    dsa_score = np.random.normal(loc=65, scale=15, size=num_samples)
    aptitude_score = np.random.normal(loc=70, scale=12, size=num_samples)
    communication_score = np.random.normal(loc=75, scale=10, size=num_samples)
    mock_interview_avg_score = np.random.normal(loc=60, scale=18, size=num_samples)
    
    # Clip all scores to be between 0 and 100
    dsa_score = np.clip(dsa_score, 0, 100)
    aptitude_score = np.clip(aptitude_score, 0, 100)
    communication_score = np.clip(communication_score, 0, 100)
    mock_interview_avg_score = np.clip(mock_interview_avg_score, 0, 100)
    
    # 2. Define the logical rule for placement (hidden to the model, but creates correlation)
    # We create a 'weighted score'. DSA and Mock Interview are most important for placements.
    weighted_score = (
        (cgpa / 10.0) * 15 +             # Max 15 points
        (dsa_score / 100.0) * 35 +       # Max 35 points
        (aptitude_score / 100.0) * 15 +  # Max 15 points
        (communication_score / 100.0) * 10 + # Max 10 points
        (mock_interview_avg_score / 100.0) * 25 # Max 25 points
    ) # Total max = 100
    
    # Add some randomness (luck/noise factor in interviews)
    noise = np.random.normal(loc=0, scale=5, size=num_samples)
    final_score = weighted_score + noise
    
    # If final score > 65, they get placed (1), else not placed (0)
    placed = (final_score > 65).astype(int)
    
    # 3. Create DataFrame and save to CSV
    df = pd.DataFrame({
        'cgpa': np.round(cgpa, 2),
        'dsa_score': np.round(dsa_score, 1),
        'aptitude_score': np.round(aptitude_score, 1),
        'communication_score': np.round(communication_score, 1),
        'mock_interview_avg_score': np.round(mock_interview_avg_score, 1),
        'placed': placed
    })
    
    os.makedirs('data', exist_ok=True)
    csv_path = 'data/synthetic_placement_data.csv'
    df.to_csv(csv_path, index=False)
    
    print(f"✅ Generated {num_samples} records and saved to {csv_path}")
    print(f"Placement Rate in dataset: {df['placed'].mean() * 100:.2f}%")
    print(df.head())

if __name__ == "__main__":
    generate_synthetic_data(1000)
