import json
import joblib  # type: ignore[reportMissingTypeStubs]
from typing import Any, cast

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split  # type: ignore[reportUnknownVariableType]
from sklearn.metrics import classification_report  # type: ignore[reportUnknownVariableType]

# Load preprocessed legal chunks
rows: list[dict[str, str]] = [
    json.loads(line)
    for line in open("data/processed/chunks.jsonl", encoding="utf-8")
    if line.strip()
]
X: list[str] = [f"{row.get('title', '')} {row.get('text', '')}" for row in rows]
y: list[str] = [row["category"] for row in rows]

# 80-20 stratified train-test split
Xtr, Xte, ytr, yte = cast(
    tuple[list[str], list[str], list[str], list[str]],
    train_test_split(X, y, test_size=0.2, random_state=42, stratify=y),
)

# TF-IDF Vectorizer (unigrams + bigrams) + Balanced Logistic Regression
clf: Any = Pipeline(
    [
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True)),
        ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced")),
    ]
)

# Train the model
clf.fit(Xtr, ytr)

# Evaluate and save
predictions = cast(list[str], clf.predict(Xte))
print(cast(str, classification_report(yte, predictions)))
joblib.dump(clf, "data/topic_clf.joblib")  # type: ignore[reportUnknownMemberType]
print("Model saved to data/topic_clf.joblib")