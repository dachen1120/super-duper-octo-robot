insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 4, 11, 'A', 'Not really. Nvidia''s Jensen Huang congratulated them on X today.', '不完全是。英伟达的黄仁勋今天在 X 上祝贺了他们。', '[{"word": "not really", "pos": "phrase", "meaning": "不完全是；也不尽然"}, {"word": "congratulate", "pos": "v.", "meaning": "祝贺"}, {"word": "today", "pos": "adv.", "meaning": "今天"}]'::jsonb, '{"title": "congratulate sb. on sth.", "body": "congratulate them on X 意为“在 X 上祝贺他们”；整句用一般过去时 congratulated。"}'::jsonb, 'audio/turns/t-0011.mp3', 50392, 56776);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 4, 12, 'B', 'He said AGI is already here, right?', '他说 AGI 已经到了，对吧？', '[{"word": "already", "pos": "adv.", "meaning": "已经"}, {"word": "right", "pos": "adv.", "meaning": "对吧（表求证）"}]'::jsonb, '{"title": "陈述句 + right?", "body": "句末加 right? 构成求证式疑问，相当于反意疑问句“……，对吧？”。"}'::jsonb, 'audio/turns/t-0012.mp3', 57196, 61012);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 4, 13, 'A', 'Yes. But AI critic Gary Marcus pushed back hard.', '对。但 AI 批评者加里·马库斯强烈反驳。', '[{"word": "critic", "pos": "n.", "meaning": "批评者；评论家"}, {"word": "push back", "pos": "phr.v.", "meaning": "反驳；抵制"}, {"word": "hard", "pos": "adv.", "meaning": "猛烈地；用力地"}]'::jsonb, '{"title": "短语动词 push back", "body": "push back 是短语动词，意为“反驳”；hard 作副词修饰它，加强“激烈”的程度。"}'::jsonb, 'audio/turns/t-0013.mp3', 61432, 66904);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 4, 14, 'B', 'Why though? What''s his point?', '可为什么呀？他的观点是什么？', '[{"word": "why", "pos": "adv.", "meaning": "为什么"}, {"word": "though", "pos": "adv.", "meaning": "不过；到底（口语加强语气）"}, {"word": "point", "pos": "n.", "meaning": "观点；要点"}]'::jsonb, '{"title": "Why though? 口语追问", "body": "though 置于句末加强追问语气，意为“可为什么呢？”；What''s 是 What is 的缩略。"}'::jsonb, 'audio/turns/t-0014.mp3', 67324, 71116);
insert into public.dialogue_turns
  (batch_id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms)
values
  (3, 4, 15, 'A', 'He says Huang offered no proof, just a bold claim.', '他说黄仁勋没拿出证据，只是大胆宣称。', '[{"word": "offer", "pos": "v.", "meaning": "提供"}, {"word": "proof", "pos": "n.", "meaning": "证据"}, {"word": "bold", "pos": "adj.", "meaning": "大胆的"}, {"word": "claim", "pos": "n.", "meaning": "宣称；主张"}]'::jsonb, '{"title": "offer sb. no sth.", "body": "offered no proof 意为“没有提供任何证据”；just 表“仅仅”，引出对比。"}'::jsonb, 'audio/turns/t-0015.mp3', 71536, 75784);