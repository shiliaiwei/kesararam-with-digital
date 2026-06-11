#!/usr/bin/env python3
"""
Database Backup Script - All 8 Categories
Fetches data directly from Neon PostgreSQL database
Generates one structured .txt file per category
Tables queried: categories, topics, questions, answers
"""

import psycopg2
import psycopg2.extras
import os
from datetime import datetime

# Database connection string (from .env.local)
DATABASE_URL = (
    "postgresql://neondb_owner:npg_y9fUH8gsZGVW"
    "@ep-rapid-glitter-am81r7j8-pooler.c-5.us-east-1.aws.neon.tech"
    "/neondb?sslmode=require&channel_binding=require"
)

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

DIVIDER      = "=" * 72
SUB_DIVIDER  = "-" * 72
THIN_DIVIDER = "." * 72

def connect():
    print("Connecting to Neon PostgreSQL database...")
    conn = psycopg2.connect(DATABASE_URL)
    print("Connected successfully.")
    return conn


def fetch_categories(cur):
    cur.execute("""
        SELECT id, slug, title_en, title_km, sort_order
        FROM categories
        ORDER BY sort_order ASC, id ASC
    """)
    return cur.fetchall()


def fetch_topics_for_category(cur, category_id):
    cur.execute("""
        SELECT
            id,
            topic_code,
            name_en,
            name_km,
            description_en,
            description_km,
            primary_image_url,
            law_reference,
            sub_group,
            status,
            sort_order
        FROM topics
        WHERE category_id = %s
        ORDER BY sort_order ASC, topic_code ASC
    """, (category_id,))
    return cur.fetchall()


def fetch_questions_for_topic(cur, topic_id):
    cur.execute("""
        SELECT
            id,
            question_en,
            question_km,
            image_url,
            difficulty,
            question_type,
            sort_order
        FROM questions
        WHERE topic_id = %s
        ORDER BY sort_order ASC, id ASC
    """, (topic_id,))
    return cur.fetchall()


def fetch_content_items_for_category(cur, category_id):
    """Fallback: fetch from content_items if topics is empty"""
    cur.execute("""
        SELECT
            id,
            title_en,
            title_km,
            description_en,
            description_km,
            image_url,
            question_en,
            question_km,
            answer_en,
            answer_km,
            hint_en,
            hint_km,
            difficulty,
            subtopic,
            sort_order,
            status
        FROM content_items
        WHERE category_id = %s
        ORDER BY sort_order ASC, id ASC
    """, (category_id,))
    return cur.fetchall()


def fetch_answers_for_question(cur, question_id):
    cur.execute("""
        SELECT
            id,
            answer_en,
            answer_km,
            is_correct,
            sort_order
        FROM answers
        WHERE question_id = %s
        ORDER BY sort_order ASC, id ASC
    """, (question_id,))
    return cur.fetchall()


def write_topic_block(out, topic, topic_num, questions, cur):
    (t_id, t_code, t_name_en, t_name_km,
     t_desc_en, t_desc_km, t_image_url,
     t_law_ref, t_sub_group, t_status, t_sort) = topic

    out.write(SUB_DIVIDER + "\n")
    out.write(f"TOPIC {topic_num:03d}\n")
    out.write(SUB_DIVIDER + "\n")
    out.write(f"  CODE          : {t_code or 'N/A'}\n")
    out.write(f"  SUB-GROUP     : {t_sub_group or 'N/A'}\n")
    out.write(f"  STATUS        : {t_status or 'N/A'}\n")
    out.write(f"  LAW REFERENCE : {t_law_ref or 'N/A'}\n")
    out.write("\n")
    out.write(f"  NAME (EN) : {t_name_en or ''}\n")
    out.write(f"  NAME (KM) : {t_name_km or ''}\n")
    out.write("\n")
    out.write(f"  DESCRIPTION (EN):\n")
    for line in (t_desc_en or '').strip().splitlines():
        out.write(f"    {line}\n")
    out.write("\n")
    out.write(f"  DESCRIPTION (KM):\n")
    for line in (t_desc_km or '').strip().splitlines():
        out.write(f"    {line}\n")
    out.write("\n")
    if t_image_url:
        out.write(f"  IMAGE URL : {t_image_url}\n")
    else:
        out.write(f"  IMAGE URL : (none)\n")
    out.write("\n")

    if not questions:
        out.write("  (No questions linked to this topic)\n")
        out.write("\n")
        return

    for q_num, question in enumerate(questions, 1):
        (q_id, q_en, q_km, q_image, q_diff,
         q_type, q_sort) = question

        answers = fetch_answers_for_question(cur, q_id)

        out.write(THIN_DIVIDER + "\n")
        out.write(f"  QUESTION {q_num:03d}\n")
        out.write(THIN_DIVIDER + "\n")
        out.write(f"    TYPE       : {q_type or 'quiz'}\n")
        out.write(f"    DIFFICULTY : {q_diff or 'N/A'}\n")
        if q_image:
            out.write(f"    IMAGE URL  : {q_image}\n")
        out.write("\n")
        out.write(f"    QUESTION (EN) : {q_en or ''}\n")
        out.write(f"    QUESTION (KM) : {q_km or ''}\n")
        out.write("\n")

        if answers:
            out.write("    ANSWERS:\n")
            correct_shown = False
            for a_num, ans in enumerate(answers, 1):
                (a_id, a_en, a_km, a_correct, a_sort) = ans
                correct_mark = "  <-- CORRECT ANSWER" if a_correct else ""
                out.write(f"      {a_num}. [EN] {a_en or ''}{correct_mark}\n")
                out.write(f"         [KM] {a_km or ''}\n")
        else:
            out.write("    (No multiple-choice answers - open-ended or flashcard)\n")

        out.write("\n")


def write_content_item_block(out, item, item_num):
    (c_id, c_title_en, c_title_km,
     c_desc_en, c_desc_km, c_image_url,
     c_q_en, c_q_km, c_a_en, c_a_km,
     c_hint_en, c_hint_km,
     c_diff, c_subtopic, c_sort, c_status) = item

    out.write(THIN_DIVIDER + "\n")
    out.write(f"  CONTENT ITEM {item_num:03d}\n")
    out.write(THIN_DIVIDER + "\n")
    out.write(f"    SUBTOPIC   : {c_subtopic or 'N/A'}\n")
    out.write(f"    DIFFICULTY : {c_diff or 'N/A'}\n")
    out.write(f"    STATUS     : {c_status or 'N/A'}\n")
    out.write("\n")
    out.write(f"    TITLE (EN) : {c_title_en or ''}\n")
    out.write(f"    TITLE (KM) : {c_title_km or ''}\n")
    out.write("\n")
    out.write(f"    DESCRIPTION (EN):\n")
    for line in (c_desc_en or '').strip().splitlines():
        out.write(f"      {line}\n")
    out.write("\n")
    out.write(f"    DESCRIPTION (KM):\n")
    for line in (c_desc_km or '').strip().splitlines():
        out.write(f"      {line}\n")
    out.write("\n")
    out.write(f"    IMAGE URL : {c_image_url or '(none)'}\n")
    out.write("\n")

    if c_q_en or c_q_km:
        out.write(f"    QUESTION (EN) : {c_q_en or ''}\n")
        out.write(f"    QUESTION (KM) : {c_q_km or ''}\n")
        out.write("\n")

    if c_a_en or c_a_km:
        out.write(f"    ANSWER (EN) : {c_a_en or ''}\n")
        out.write(f"    ANSWER (KM) : {c_a_km or ''}\n")
        out.write("\n")

    if c_hint_en or c_hint_km:
        out.write(f"    HINT (EN) : {c_hint_en or ''}\n")
        out.write(f"    HINT (KM) : {c_hint_km or ''}\n")
        out.write("\n")


def generate_category_file(conn, category):
    cur = conn.cursor()

    (cat_id, cat_slug, cat_title_en, cat_title_km, cat_sort) = category
    cat_num = cat_sort if cat_sort else cat_id

    # Safe filename
    safe_slug = (cat_slug or f"cat{cat_id}").replace(" ", "_").replace("/", "_")
    filename = f"DB_CAT{cat_num:02d}_{safe_slug}_backup.txt"
    filepath = os.path.join(OUTPUT_DIR, filename)

    print(f"  Generating: {filename} ...")

    topics   = fetch_topics_for_category(cur, cat_id)
    c_items  = fetch_content_items_for_category(cur, cat_id)

    with open(filepath, "w", encoding="utf-8") as out:
        # Header
        out.write(DIVIDER + "\n")
        out.write(f"  DATABASE BACKUP - DIRECT FETCH FROM NEON POSTGRESQL\n")
        out.write(DIVIDER + "\n")
        out.write(f"  Generated    : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        out.write(f"  Database     : Neon PostgreSQL (ep-rapid-glitter-am81r7j8)\n")
        out.write(f"  Category ID  : {cat_id}\n")
        out.write(f"  Category No  : {cat_num}\n")
        out.write(f"  Slug         : {cat_slug or 'N/A'}\n")
        out.write(f"  Title (EN)   : {cat_title_en or 'N/A'}\n")
        out.write(f"  Title (KM)   : {cat_title_km or 'N/A'}\n")
        out.write(f"  Topics Found : {len(topics)}\n")
        out.write(f"  Content Items: {len(c_items)}\n")
        out.write(DIVIDER + "\n")
        out.write("\n")

        # ── SECTION A: TOPICS + QUESTIONS + ANSWERS ──────────────────────
        out.write(DIVIDER + "\n")
        out.write("  SECTION A: TOPICS WITH QUESTIONS AND ANSWERS\n")
        out.write(f"  (Source tables: topics, questions, answers)\n")
        out.write(DIVIDER + "\n")
        out.write("\n")

        if topics:
            for t_num, topic in enumerate(topics, 1):
                questions = fetch_questions_for_topic(cur, topic[0])
                write_topic_block(out, topic, t_num, questions, cur)
                out.write("\n")
        else:
            out.write("  (No records found in the 'topics' table for this category)\n")
            out.write("\n")

        # ── SECTION B: CONTENT ITEMS (legacy/alternate table) ─────────────
        out.write(DIVIDER + "\n")
        out.write("  SECTION B: CONTENT ITEMS\n")
        out.write(f"  (Source table: content_items)\n")
        out.write(DIVIDER + "\n")
        out.write("\n")

        if c_items:
            for i_num, item in enumerate(c_items, 1):
                write_content_item_block(out, item, i_num)
        else:
            out.write("  (No records found in the 'content_items' table for this category)\n")
            out.write("\n")

        # Footer
        out.write(DIVIDER + "\n")
        out.write("  END OF BACKUP\n")
        out.write(DIVIDER + "\n")

    cur.close()
    print(f"    Done. Topics={len(topics)}, ContentItems={len(c_items)}")
    return filepath, len(topics), len(c_items)


def main():
    print("\n" + "=" * 72)
    print("  KESARARAM DATABASE BACKUP - ALL CATEGORIES")
    print("  Fetching directly from Neon PostgreSQL")
    print("=" * 72 + "\n")

    conn = connect()
    cur  = conn.cursor()

    categories = fetch_categories(cur)
    cur.close()

    print(f"\nFound {len(categories)} categories.\n")
    for cat in categories:
        print(f"  ID={cat[0]} | Sort={cat[4]} | Slug={cat[1]} | EN={cat[2]}")

    print(f"\nGenerating backup files to:\n  {OUTPUT_DIR}\n")

    summary = []
    for cat in categories:
        fp, n_topics, n_items = generate_category_file(conn, cat)
        summary.append({
            "file"  : os.path.basename(fp),
            "topics": n_topics,
            "items" : n_items,
        })

    conn.close()

    print("\n" + "=" * 72)
    print("  SUMMARY")
    print("=" * 72)
    for s in summary:
        print(f"  {s['file']}")
        print(f"    Topics={s['topics']}  ContentItems={s['items']}")
    print("\nAll backups generated successfully.\n")


if __name__ == "__main__":
    main()
