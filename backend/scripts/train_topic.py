import json
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Data Loading all legal chunks from data/processed/chunks.jsonl
rows = [json.loads(line) for line in open("data/processed/chunks.jsonl", encoding="utf-8")]

# Feature extraction and label preparation for topic classification
X = [f"{r['title']} {r['text']}" for r in rows]
y = [r["category"] for r in rows]
Xtr, Xte, ytr, yte = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

# Train Scikit-learn pipeline with TF-IDF features and logistic regression
clf = make_pipeline(
    TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True),
    LogisticRegression(max_iter=1000, class_weight="balanced"),
)
clf.fit(Xtr, ytr)
print(classification_report(yte, clf.predict(Xte)))
joblib.dump(clf, "data/topic_clf.joblib")