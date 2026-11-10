"""
NEUROARM Model Training Pipeline:
Trains Random Forest, Support Vector Machine (SVM), and Multi-Layer Perceptron (MLP)
models with 5-Fold Stratified Cross-Validation, generates research metrics,
and serializes artifacts into ml/models/.
"""
import os
import json
import time
from typing import Dict, Any
import numpy as np
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

from .config import CLASSES, default_config
from .features import get_feature_names
from .dataset_loader import dataset_loader

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_ARCHITECTURES = {
    "rf": {
        "name": "Random Forest v2.4",
        "file": "rf_classifier.joblib",
        "estimator": lambda: RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            min_samples_split=4,
            random_state=default_config.random_state
        )
    },
    "svm": {
        "name": "SVM-RBF v2.1",
        "file": "svm_classifier.joblib",
        "estimator": lambda: SVC(
            kernel="rbf",
            C=1.2,
            gamma="scale",
            probability=True,
            random_state=default_config.random_state
        )
    },
    "mlp": {
        "name": "1D-NeuralNet (MLP)",
        "file": "mlp_classifier.joblib",
        "estimator": lambda: MLPClassifier(
            hidden_layer_sizes=(128, 64),
            activation="relu",
            max_iter=350,
            random_state=default_config.random_state
        )
    },
    "lda": {
        "name": "LDA-Baseline v1.0",
        "file": "lda_classifier.joblib",
        "estimator": lambda: LinearDiscriminantAnalysis(solver="svd")
    }
}

def train_and_export_all(samples_per_class: int = 50) -> Dict[str, Any]:
    """Runs training across all architectures, validates with 5-fold CV, and exports models."""
    print("=" * 65)
    print("  NEUROARM BCI MACHINE LEARNING TRAINING PIPELINE")
    print(f"  Target Classes ({len(CLASSES)}): {', '.join(CLASSES)}")
    print(f"  Samples per class: {samples_per_class} | 5-Fold Stratified CV")
    print("=" * 65)

    X, y = dataset_loader.generate_balanced_dataset(samples_per_class=samples_per_class)
    feature_names = get_feature_names()
    print(f"[*] Dataset matrix constructed: {X.shape[0]} samples x {X.shape[1]} features")

    registry = {
        "version": "1.0.0",
        "dataset_samples": len(X),
        "features_dim": X.shape[1],
        "classes": CLASSES,
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "models": {}
    }

    results = {}

    for key, spec in MODEL_ARCHITECTURES.items():
        print(f"\n[>] Training {spec['name']}...")
        clf = spec["estimator"]()

        # 5-Fold Stratified Cross-Validation
        skf = StratifiedKFold(n_splits=default_config.n_splits_cv, shuffle=True, random_state=default_config.random_state)
        cv_accuracies = []
        cv_f1s = []

        for train_idx, val_idx in skf.split(X, y):
            X_tr, y_tr = X[train_idx], y[train_idx]
            X_val, y_val = X[val_idx], y[val_idx]

            fold_model = spec["estimator"]()
            fold_model.fit(X_tr, y_tr)
            y_pred_val = fold_model.predict(X_val)

            cv_accuracies.append(accuracy_score(y_val, y_pred_val))
            _, _, f1_val, _ = precision_recall_fscore_support(y_val, y_pred_val, average="weighted", zero_division=0)
            cv_f1s.append(f1_val)

        # Fit final model on full dataset
        clf.fit(X, y)
        y_pred = clf.predict(X)
        acc = float(accuracy_score(y, y_pred))
        precision, recall, f1, _ = precision_recall_fscore_support(y, y_pred, average="weighted", zero_division=0)
        cm = confusion_matrix(y, y_pred, labels=list(range(len(CLASSES)))).tolist()

        # Measure benchmark latency on 100 iterations
        t0 = time.perf_counter()
        for _ in range(100):
            clf.predict(X[:1])
        latency_ms = round(((time.perf_counter() - t0) / 100.0) * 1000.0, 2)

        # Save model artifact to models directory
        model_path = os.path.join(MODELS_DIR, spec["file"])
        joblib.dump(clf, model_path)

        cv_mean_acc = round(float(np.mean(cv_accuracies)) * 100.0, 2)
        cv_std_acc = round(float(np.std(cv_accuracies)) * 100.0, 2)

        metrics = {
            "name": spec["name"],
            "key": key,
            "filename": spec["file"],
            "file_size_bytes": os.path.getsize(model_path),
            "cv_accuracy_mean": cv_mean_acc,
            "cv_accuracy_std": cv_std_acc,
            "train_accuracy": round(acc * 100.0, 2),
            "precision": round(float(precision) * 100.0, 2),
            "recall": round(float(recall) * 100.0, 2),
            "f1_score": round(float(f1) * 100.0, 2),
            "latency_ms": latency_ms,
            "confusion_matrix": cm,
            "is_primary": (key == "rf")
        }

        registry["models"][key] = metrics
        results[key] = metrics

        print(f"    - CV Accuracy: {cv_mean_acc}% (+/- {cv_std_acc}%)")
        print(f"    - F1-Score:    {metrics['f1_score']}%")
        print(f"    - Latency:     {latency_ms} ms")
        print(f"    - Saved to:    {model_path} ({os.path.getsize(model_path):,} bytes)")

    # Save registry manifest
    registry_path = os.path.join(MODELS_DIR, "registry.json")
    with open(registry_path, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2)
    print(f"\n[OK] Model registry written to: {registry_path}")

    # Top feature importances from primary RF model
    rf_clf = joblib.load(os.path.join(MODELS_DIR, MODEL_ARCHITECTURES["rf"]["file"]))
    if hasattr(rf_clf, "feature_importances_"):
        top_indices = np.argsort(rf_clf.feature_importances_)[::-1][:10]
        print("\nTop 10 Important Electrophysiological Features (Random Forest):")
        for rank, idx in enumerate(top_indices, start=1):
            name = feature_names[idx] if idx < len(feature_names) else f"Feat_{idx}"
            score = round(float(rf_clf.feature_importances_[idx]) * 100.0, 2)
            print(f"  {rank:2d}. {name:<32} {score:>5.2f}%")

    print("=" * 65)
    print("[OK] Training pipeline complete. All models ready for deployment.")
    return registry

if __name__ == "__main__":
    train_and_export_all()
