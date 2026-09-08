# -*- coding: utf-8 -*-
"""Generate an idempotent Supabase import DO-block from a content sample JSON.

Usage:
  python scripts/import_content_to_db.py content/samples/ai-tech-2026-09-07.json [out.sql]

The JSON is embedded as a dollar-quoted jsonb literal; news/turn text may contain
apostrophes safely. The DO block upserts the content_batches row (unique by
industry+date), deletes its news/turns, then re-inserts news_items and
dialogue_turns. Audio URLs are stored as the JSON's relative "audio/..." srcs.
"""
import json
import sys


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: import_content_to_db.py <sample.json> [out.sql]")
    src = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else None
    data = json.load(open(src, encoding="utf-8"))
    raw = open(src, encoding="utf-8").read()

    slug = data.get("industry", {}).get("id", "ai-tech")
    if "$json$" in raw or "$body$" in raw:
        sys.exit("refusing to embed: JSON contains a dollar-quote delimiter")

    sql = (
        "do $body$\n"
        "declare\n"
        "  j jsonb := $json$\n" + raw + "\n$json$;\n"
        "  v_industry bigint;\n"
        "  v_batch bigint;\n"
        "  v_idx int;\n"
        "  v_rel int;\n"
        "begin\n"
        "  select id into v_industry from public.industries where slug = " + quote_literal(slug) + ";\n"
        "  if v_industry is null then raise exception 'industry not found: %', " + quote_literal(slug) + "; end if;\n"
        "\n"
        "  insert into public.content_batches\n"
        "    (industry_id, brief_date, status, title, title_en, full_audio_url, duration_ms, model, published_at)\n"
        "  values\n"
        "    (v_industry,\n"
        "     (j->>'generatedAt')::date,\n"
        "     'published',\n"
        "     j->'dialogue'->>'title',\n"
        "     j->'dialogue'->>'titleEn',\n"
        "     j->'dialogue'->'audio'->>'src',\n"
        "     (j->'dialogue'->'audio'->>'durationMs')::int,\n"
        "     'manual-sample',\n"
        "     now())\n"
        "  on conflict (industry_id, brief_date) do update set\n"
        "    status = excluded.status,\n"
        "    title = excluded.title,\n"
        "    title_en = excluded.title_en,\n"
        "    full_audio_url = excluded.full_audio_url,\n"
        "    duration_ms = excluded.duration_ms,\n"
        "    model = excluded.model,\n"
        "    published_at = excluded.published_at\n"
        "  returning id into v_batch;\n"
        "\n"
        "  -- 幂等：先清旧内容（用户统计/收藏等引用会按 FK 规则级联或置空）\n"
        "  delete from public.dialogue_turns where batch_id = v_batch;\n"
        "  delete from public.news_items where batch_id = v_batch;\n"
        "\n"
        "  -- news\n"
        "  for v_idx in 0 .. jsonb_array_length(j->'news') - 1 loop\n"
        "    insert into public.news_items\n"
        "      (batch_id, importance, headline_zh, headline_en, summary_zh, summary_en, tags, source_name, source_url, published_at)\n"
        "    values\n"
        "      (v_batch,\n"
        "       (j->'news'->v_idx->>'importance')::int,\n"
        "       j->'news'->v_idx->>'headline',\n"
        "       j->'news'->v_idx->>'headlineEn',\n"
        "       j->'news'->v_idx->>'summary',\n"
        "       j->'news'->v_idx->>'summaryEn',\n"
        "       coalesce(array(select jsonb_array_elements_text(j->'news'->v_idx->'tags')), '{}'::text[]),\n"
        "       j->'news'->v_idx->>'source',\n"
        "       j->'news'->v_idx->>'sourceUrl',\n"
        "       (j->'news'->v_idx->>'updatedAt')::timestamptz);\n"
        "  end loop;\n"
        "\n"
        "  -- turns（relatedNewsId 末尾数字 = news importance）\n"
        "  for v_idx in 0 .. jsonb_array_length(j->'dialogue'->'turns') - 1 loop\n"
        "    v_rel := null;\n"
        "    if (j->'dialogue'->'turns'->v_idx->>'relatedNewsId') is not null then\n"
        "      v_rel := substring(j->'dialogue'->'turns'->v_idx->>'relatedNewsId' from '[0-9]+$')::int;\n"
        "    end if;\n"
        "    insert into public.dialogue_turns\n"
        "      (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)\n"
        "    values\n"
        "      (v_batch,\n"
        "       case when v_rel is not null\n"
        "            then (select n.id from public.news_items n where n.batch_id = v_batch and n.importance = v_rel limit 1)\n"
        "            else null end,\n"
        "       v_idx + 1,\n"
        "       j->'dialogue'->'turns'->v_idx->>'speaker',\n"
        "       j->'dialogue'->'turns'->v_idx->>'en',\n"
        "       j->'dialogue'->'turns'->v_idx->>'zh',\n"
        "       coalesce(j->'dialogue'->'turns'->v_idx->'glosses', '[]'::jsonb),\n"
        "       coalesce(j->'dialogue'->'turns'->v_idx->'grammar', '{}'::jsonb),\n"
        "       j->'dialogue'->'turns'->v_idx->'audio'->>'src',\n"
        "       (j->'dialogue'->'turns'->v_idx->'audio'->>'startMs')::int,\n"
        "       (j->'dialogue'->'turns'->v_idx->'audio'->>'endMs')::int);\n"
        "  end loop;\n"
        "end\n"
        "$body$;"
    )

    if out:
        with open(out, "w", encoding="utf-8") as f:
            f.write(sql)
        print("wrote", out, len(sql), "chars")
    else:
        print(sql)


def quote_literal(s):
    return "'" + s.replace("'", "''") + "'"


if __name__ == "__main__":
    main()