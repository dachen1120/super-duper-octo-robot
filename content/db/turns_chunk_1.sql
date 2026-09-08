insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, NULL, 1, 'A', 'Hey, did you catch the AI news this week?', '嘿，这周的 AI 新闻你看了吗？', '[{"word": "catch", "pos": "v.", "meaning": "得知；看到/听到（新闻）"}, {"word": "AI", "pos": "n.", "meaning": "人工智能（artificial intelligence）"}, {"word": "news", "pos": "n.", "meaning": "新闻"}, {"word": "week", "pos": "n.", "meaning": "星期；周"}]'::jsonb, '{"title": "一般过去时疑问句 did + 动词原形", "body": "Did you catch…? 用助动词 did 提问，后接动词原形 catch，询问过去是否看到/听到过某信息。"}'::jsonb, 'audio/turns/t-0001.mp3', 0, 3528);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, NULL, 2, 'B', 'Not yet. What''s the biggest story?', '还没呢。最大的新闻是什么？', '[{"word": "yet", "pos": "adv.", "meaning": "还，尚（用于否定句）"}, {"word": "biggest", "pos": "adj.", "meaning": "最大的（big 的最高级）"}, {"word": "story", "pos": "n.", "meaning": "报道；新闻事件"}]'::jsonb, '{"title": "省略句 Not yet", "body": "Not yet 是 I haven''t caught the news yet 的省略；What''s 是 What is 的缩略。"}'::jsonb, 'audio/turns/t-0002.mp3', 3948, 8268);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 3, 3, 'A', 'OpenAI dropped its new flagship model, GPT-6 Astra.', 'OpenAI 发布了新旗舰模型 GPT-6 Astra。', '[{"word": "drop", "pos": "v.", "meaning": "发布；推出（口语）"}, {"word": "flagship", "pos": "adj.", "meaning": "旗舰的；最重要的"}, {"word": "model", "pos": "n.", "meaning": "模型"}]'::jsonb, '{"title": "一般过去时 + 同位语", "body": "dropped 表已完成的动作；its 指 OpenAI 的；GPT-6 Astra 作 model 的同位语，补充说明模型名称。"}'::jsonb, 'audio/turns/t-0003.mp3', 9068, 14180);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 3, 4, 'B', 'No way! When did that happen?', '不会吧！这是什么时候的事？', '[{"word": "no way", "pos": "phrase", "meaning": "不会吧；不可能（表惊讶）"}, {"word": "happen", "pos": "v.", "meaning": "发生"}]'::jsonb, '{"title": "感叹 + 过去时疑问", "body": "No way! 是口语感叹，表强烈惊讶；When did that happen? 用 did + 动词原形询问过去时间。"}'::jsonb, 'audio/turns/t-0004.mp3', 14600, 18680);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 3, 5, 'A', 'Just a few days ago. Chinese media call it their biggest flagship update since GPT-5.', '就几天前。中国媒体称它是 GPT-5 之后最大的一次旗舰更新。', '[{"word": "a few", "pos": "det.", "meaning": "几个"}, {"word": "ago", "pos": "adv.", "meaning": "以前"}, {"word": "media", "pos": "n.", "meaning": "媒体（medium 的复数）"}, {"word": "call", "pos": "v.", "meaning": "称……为"}, {"word": "biggest", "pos": "adj.", "meaning": "最大的"}, {"word": "update", "pos": "n.", "meaning": "更新；新版"}, {"word": "since", "pos": "prep.", "meaning": "自从"}]'::jsonb, '{"title": "call A B 结构", "body": "call it their biggest flagship update 意为“把它称为他们最大的旗舰更新”；since GPT-5 引出时间起点。"}'::jsonb, 'audio/turns/t-0005.mp3', 19100, 26780);