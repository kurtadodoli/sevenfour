import csv, os

DATASET_DIR = "datasets"

for file in os.listdir(DATASET_DIR):
    if file.endswith(".csv"):
        fixed_lines = []
        path = os.path.join(DATASET_DIR, file)
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            for row in reader:
                if not row:
                    continue
                if len(row) > 3:
                    row = [row[0], row[1], ",".join(row[2:])]
                fixed_lines.append(row)

        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f, quoting=csv.QUOTE_ALL)
            writer.writerows(fixed_lines)

        print(f"✅ Fixed {file}")
