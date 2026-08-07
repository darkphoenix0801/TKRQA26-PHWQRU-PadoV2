import pandas as pd
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import accuracy_score, classification_report
from xgboost import XGBClassifier
import joblib
import os

def train_and_tune_model():
    print("🚀 Starting Model Training and Hyperparameter Tuning...")
    
    # Dynamically find the absolute path to the data file so it works from anywhere
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '../../'))
    data_path = os.path.join(project_root, 'data', 'synthetic_placement_data.csv')
    
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Could not find dataset at {data_path}")
        
    df = pd.read_csv(data_path)
    print(f"✅ Loaded {len(df)} records from the dataset.")
    
    # 2. Split into Features (X) and Target (y)
    X = df[['cgpa', 'dsa_score', 'aptitude_score', 'communication_score', 'mock_interview_avg_score']]
    y = df['placed']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 3. Define the base model (Removed use_label_encoder=False to fix the deprecation error)
    base_model = XGBClassifier(eval_metric='logloss')
    
    # 4. Define the hyperparameter grid
    param_dist = {
        'max_depth': [3, 4, 5, 6, 7],               
        'learning_rate': [0.01, 0.05, 0.1, 0.2],    
        'n_estimators': [50, 100, 150, 200],        
        'subsample': [0.6, 0.8, 1.0],               
        'colsample_bytree': [0.6, 0.8, 1.0],        
        'min_child_weight': [1, 3, 5]               
    }
    
    print("⏳ Running RandomizedSearchCV (tuning hyperparameters)... This might take a minute.")
    
    search = RandomizedSearchCV(
        estimator=base_model,
        param_distributions=param_dist,
        n_iter=25,          
        cv=5,               
        scoring='accuracy', 
        random_state=42,
        n_jobs=-1           
    )
    
    search.fit(X_train, y_train)
    best_model = search.best_estimator_
    
    print("\n🎉 TUNING COMPLETE! 🎉")
    print("-" * 30)
    print(f"🥇 Best Hyperparameters Found:")
    for key, value in search.best_params_.items():
        print(f"   - {key}: {value}")
    print("-" * 30)
    print(f"📈 Best Cross-Validation Accuracy: {search.best_score_ * 100:.2f}%")
    
    y_pred = best_model.predict(X_test)
    test_acc = accuracy_score(y_test, y_pred)
    
    print(f"🎯 Accuracy on Unseen Test Data: {test_acc * 100:.2f}%")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred))
    
    # Dynamically find the absolute path to save the model
    ml_dir = os.path.join(project_root, 'backend', 'ml')
    os.makedirs(ml_dir, exist_ok=True)
    model_path = os.path.join(ml_dir, 'placement_model.pkl')
    joblib.dump(best_model, model_path)
    
    print(f"💾 Model saved successfully to {model_path}!")

if __name__ == "__main__":
    train_and_tune_model()
